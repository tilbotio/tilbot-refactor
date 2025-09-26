import { app, protocol, net, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { fork, type ChildProcess } from "child_process";
import fs from "fs";
import { rm, mkdir, copyFile, readFile } from "fs/promises";
import publicIp from "public-ip";
import AdmZip from "adm-zip";
import { CsvData } from "../common/csvdata.ts";
import { networkInterfaces } from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let ps: ChildProcess | undefined;

let csv_datas: { [key: string]: CsvData } = {};

function createWindow() {
  const win = new BrowserWindow({
    show: false,
    title: "Tilbot",
    icon: path.join(__dirname, "src/icon/png/64x64.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });
  win.maximize();

  win.on("close", function () {
    if (ps !== undefined) {
      ps.kill("SIGTERM");
    }
  });

  // Get external and internal ip-address
  (async () => {
    let ipv4 = "localhost";
    let address = "localhost";

    try {
      const ifaces = networkInterfaces();
      for (const dev in ifaces) {
        for (const details of ifaces[dev]!) {
          if (details.family === "IPv4" && !details.internal) {
            address = details.address;
          }
        }
      }

      ipv4 = await publicIp.v4({
        timeout: 200,
      });
    } catch (e) {
      console.log("error with ip", e);
    }

    ipcMain.on("open-server", (event, project_json) => {
      const p = app.getPath("userData");
      if (!fs.existsSync(p + "/currentproject/")) {
        fs.mkdirSync(p + "/currentproject");
      }
      fs.writeFileSync(
        p + "/currentproject/electron-project.json",
        project_json
      );
      ps = fork(`${__dirname}/electron-server.cjs`, ["-p=" + p]);

      win.webContents.send("server-ip", { public_ip: ipv4, local_ip: address });
    });

    ipcMain.on("close-server", (event) => {
      if (ps !== undefined) {
        ps.kill("SIGTERM");
      }
    });
  })();

  ipcMain.on("load-project-db", (event, project) => {
    const p = app.getPath("userData");

    csv_datas = {};

    // Set up the data files
    for (const variable of project.variables) {
      if (variable.type == "csv") {
        csv_datas[variable.name] = new CsvData(
          variable.csvfile,
          `${p}/currentproject/`
        );
      }
    }
  });

  ipcMain.handle("query-db", async (event, params) => {
    if (Object.keys(csv_datas).indexOf(params.db) == -1) {
      return null;
    }

    let res = await csv_datas[params.db].get(params.col, params.val);
    return res;
  });

  ipcMain.handle("query-db-random", async (event, params) => {
    let res = await csv_datas[params.db].get_random_line();
    return res;
  });

  ipcMain.handle(
    "load-avatar",
    async (event, prev_name): Promise<string | null> => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "Avatar image",
            extensions: ["png", "jpg", "jpeg", "svg"],
          },
        ],
      });

      if (canceled) {
        return null;
      } else {
        const p = app.getPath("userData");

        await mkdir(`${p}/currentproject/avatar`, { recursive: true });

        if (prev_name) {
          // Delete previous avatar
          await rm(`${p}/currentproject/avatar/${prev_name}`, { force: true });
        }

        const [load_file] = filePaths;
        let fname = path.basename(load_file);

        await copyFile(load_file, `${p}/currentproject/avatar/${fname}`);

        return fname;
      }
    }
  );

  ipcMain.handle("load-project", async (event): Promise<string | null> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Tilbot project",
          extensions: ["tilbot", "json"],
        },
      ],
    });

    let projectJson: string | null = null;

    if (!canceled) {
      const p = app.getPath("userData");

      // Remove the old temp project
      const projectDir = `${p}/currentproject`;
      await rm(projectDir, { force: true, recursive: true });
      await mkdir(projectDir);

      const [filename] = filePaths;

      // Only one file should be allowed to be selected.
      if (filename.endsWith(".tilbot")) {
        const zip = new AdmZip(filename);
        const zipEntries = zip.getEntries(); // an array of ZipEntry records

        for (const zipEntry of zipEntries) {
          if (zipEntry.entryName == "project.json") {
            projectJson = zipEntry.getData().toString("utf8");
          } else {
            zip.extractEntryTo(zipEntry, projectDir);
          }
        }
      } else {
        projectJson = await readFile(filename, "utf8");
      }

      // @TODO: something with additional files like avatar, data files, etc.
    }

    return projectJson;
  });

  ipcMain.handle(
    "load-csv",
    async (
      event,
      params
    ): Promise<{ filename: string; csv: string } | null> => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "Comma-separated value (CSV) file",
            extensions: [".csv"],
          },
        ],
      });

      if (canceled) {
        return null;
      } else {
        const p = app.getPath("userData");

        await mkdir(`${p}/currentproject/var`, { recursive: true });

        const [load_file] = filePaths;
        let filename = path.basename(load_file);
        await copyFile(load_file, `${p}/currentproject/var/${filename}`);
        const csv = await readFile(load_file, "utf8");
        return { filename, csv };

        // @TODO: load into csvdb for use
      }
    }
  );

  ipcMain.handle("get-csv", async (event, filename): Promise<string | null> => {
    const p = app.getPath("userData");

    if (path.basename(filename) !== filename) {
      return null;
    }

    try {
      return await readFile(`${p}/currentproject/var/${filename}`, "utf8");
    } catch (e: any) {
      if (e.code !== "ENOENT") {
        throw e;
      }
      return null;
    }
  });

  ipcMain.on("get-settings", (event, params) => {
    const p = app.getPath("userData");

    if (!fs.existsSync(p + "/settings.json")) {
      let settings = {
        chatgpt_api_key: "",
        llm_setting: "chatgpt",
        llm_api_address: "",
      };

      fs.writeFileSync(p + "/settings.json", JSON.stringify(settings));
      win.webContents.send("settings-load", {
        settings: settings,
        path: p + "/currentproject/",
      });
    } else {
      win.webContents.send("settings-load", {
        settings: JSON.parse(fs.readFileSync(p + "/settings.json", "utf8")),
        path: p + "/currentproject/",
      });
    }
  });

  ipcMain.on("save-settings", (event, params) => {
    const p = app.getPath("userData");

    fs.writeFileSync(p + "/settings.json", JSON.stringify(params.settings));
  });

  ipcMain.on("do-delete-avatar", (event, fname) => {
    const p = app.getPath("userData");

    // Delete avatar
    if (fname !== "" && fs.existsSync(p + "/currentproject/" + fname)) {
      fs.rmSync(p + "/currentproject/" + fname);
    }

    // @TODO: Should we send confirmation that it has been deleted?
  });

  ipcMain.on("do-save", (event, project) => {
    let save_file = dialog.showSaveDialogSync({
      filters: [
        {
          name: "Tilbot project",
          extensions: ["tilbot"],
        },
      ],
    });

    if (save_file !== undefined) {
      const p = app.getPath("userData");

      const file = new AdmZip();
      file.addFile("project.json", Buffer.from(project));

      let proj_obj = JSON.parse(project);
      for (const v in proj_obj.variables) {
        if (proj_obj.variables[v].type == "csv") {
          file.addLocalFile(
            p + "/currentproject/var/" + proj_obj.variables[v].csvfile,
            "var"
          );
        }
      }

      if (
        proj_obj.settings !== undefined &&
        proj_obj.settings.avatar_file !== undefined &&
        proj_obj.settings.avatar_file !== ""
      ) {
        file.addLocalFile(
          p + "/currentproject/avatar/" + proj_obj.settings.avatar_file,
          "avatar"
        );
      }

      if (
        proj_obj.settings !== undefined &&
        proj_obj.settings.avatar_file_sm !== undefined &&
        proj_obj.settings.avatar_file_sm !== ""
      ) {
        file.addLocalFile(
          p + "/currentproject/avatar/" + proj_obj.settings.avatar_file_sm,
          "avatar"
        );
      }

      fs.writeFileSync(save_file, file.toBuffer());
      win.webContents.send("project-saved");
    }
  });

  /* Causes infinite loop, so disabled:
  protocol.handle("file", (request) => {

    // Some paths need to be fixed
    const url = request.url; //.substr(5);

    if (url.indexOf("build") == -1) {
      if (url.indexOf("_app") != -1) {
        return net.fetch("build/" + url.substring(url.indexOf("_app")));
      } else {
        // This should not be triggered anymore with a fix in place in the editor code
        return net.fetch("build/index.html");
      }
    } else {
      //if (url.indexOf('electron') != -1) {
      //  callback({path: path.normalize(__dirname) + '/' + url.substring(url.indexOf('electron'))});
      //}
      //else {
      return net.fetch(
        pathToFileURL(
          path.normalize(__dirname) + "/" + url.substring(url.indexOf("build"))
        ).toString()
      );
      //}
    }
  });
  */

  win.loadFile("build/editor.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
