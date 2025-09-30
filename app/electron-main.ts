import { app, protocol, net, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { fork, type ChildProcess } from "child_process";
import fs from "fs";
import { rm, mkdir, copyFile, readFile, writeFile } from "fs/promises";
import publicIp from "public-ip";
import AdmZip from "adm-zip";
import { CsvData } from "../common/csvdata.ts";
import { networkInterfaces } from "os";
import { defaultGeneralSettings } from "../common/project/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let ps: ChildProcess | undefined;

let csv_datas: { [key: string]: CsvData } = {};

// Get external and internal ip-address as a Promise;
// this effectively functions as a cached result.
const serverIP = (async () => {
  let local_ip = "localhost";

  const ifaces = networkInterfaces();
  for (const dev in ifaces) {
    for (const details of ifaces[dev]!) {
      if (details.family === "IPv4" && !details.internal) {
        local_ip = details.address;
      }
    }
  }

  const public_ip = await publicIp.v4({ timeout: 200 });

  return { public_ip, local_ip };
})();

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

  ipcMain.on("open-server", (event, project_json) => {
    const p = app.getPath("userData");
    fs.mkdirSync(`${p}/currentproject`, { recursive: true });
    fs.writeFileSync(`${p}/currentproject/electron-project.json`, project_json);
    ps = fork(`${__dirname}/electron-server.cjs`, ["-p=" + p]);
  });

  ipcMain.on("close-server", (event) => {
    ps?.kill("SIGTERM");
  });

  ipcMain.on("load-project-db", (event, project) => {
    const p = app.getPath("userData");

    csv_datas = {};

    // Set up the data files
    for (const variable of project.variables) {
      if (variable.type == "csv") {
        csv_datas[variable.name] = new CsvData(
          variable.csvfile,
          `${p}/currentproject`
        );
      }
    }
  });

  ipcMain.handle("server-ip", async (event, params) => {
    return await serverIP;
  });

  ipcMain.handle("query-db", async (event, params) => {
    const csv_data = csv_datas[params.db];
    if (csv_data === undefined) {
      return null;
    }

    return await csv_data.get(params.col, params.val);
  });

  ipcMain.handle("query-db-random", async (event, params) => {
    const csv_data = csv_datas[params.db];
    if (csv_data === undefined) {
      return null;
    }

    return await csv_data.get_random_line();
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
        const filename = path.basename(load_file);

        await copyFile(load_file, `${p}/currentproject/avatar/${filename}`);

        return filename;
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
        const filename = path.basename(load_file);
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

  ipcMain.handle("load-settings", async (event, params) => {
    const p = app.getPath("userData");

    let generalSettings = "";

    try {
      generalSettings = await readFile(`${p}/settings.json`, "utf8");
      generalSettings = JSON.stringify(
        Object.assign(JSON.parse(generalSettings), defaultGeneralSettings)
      );
    } catch (e: any) {
      if (e.code !== "ENOENT") {
        throw e;
      }
      generalSettings = JSON.stringify(defaultGeneralSettings);
    }

    return { generalSettings, path: `${p}/currentproject` };
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

  ipcMain.handle("save-project", async (event, projectJson) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [
        {
          name: "Tilbot project",
          extensions: ["tilbot"],
        },
      ],
    });

    if (!canceled) {
      const p = app.getPath("userData");

      const zip = new AdmZip();
      zip.addFile("project.json", Buffer.from(projectJson));

      const project = JSON.parse(projectJson);
      for (const variable of project.variables) {
        if (variable.type == "csv") {
          zip.addLocalFile(
            `${p}/currentproject/var/${variable.csvfile}`,
            "var"
          );
        }
      }

      if (project.settings?.avatar_file) {
        zip.addLocalFile(
          `${p}/currentproject/avatar/${project.settings.avatar_file}`,
          "avatar"
        );
      }

      if (project.settings?.avatar_file_sm) {
        zip.addLocalFile(
          `${p}/currentproject/avatar/${project.settings.avatar_file_sm}`,
          "avatar"
        );
      }

      await writeFile(filePath, zip.toBuffer());
    }

    return !canceled;
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
