#!/bin/sh
set -eu
umask 077

if [ ! -f /run/secrets/initial_admin_password ] || [ ! -r /run/secrets/initial_admin_password ]; then
  echo "Initial administrator secret must be a readable file" >&2
  exit 1
fi

install -d -o node -g node -m 0700 /run/private
install -o node -g node -m 0400 /run/secrets/initial_admin_password /run/private/initial_admin_password.tmp
mv -f /run/private/initial_admin_password.tmp /run/private/initial_admin_password

prepare() {
  source=$1
  destination=$2
  ready="$destination/.tilbot-storage-ready"
  migrating="$destination/.tilbot-storage-migrating"

  if [ ! -d "$source" ]; then
    echo "Legacy project directory is missing: $source" >&2
    exit 1
  fi
  if [ -e "$source/.tilbot-storage-ready" ] || [ -e "$source/.tilbot-storage-migrating" ]; then
    echo "Legacy project directory contains a reserved migration marker: $source" >&2
    exit 1
  fi
  if [ -e "$ready" ] && [ -e "$migrating" ]; then
    echo "Project volume has conflicting migration markers: $destination" >&2
    exit 1
  fi
  if [ ! -e "$ready" ] && [ ! -e "$migrating" ]; then
    if [ -n "$(ls -A "$destination")" ]; then
      echo "Project volume is not empty and has no migration marker: $destination" >&2
      exit 1
    fi
  fi
}

prepare /legacy/projects /data/projects
prepare /legacy/proj_pub /data/proj_pub

if { [ -e /data/projects/.tilbot-storage-ready ] &&
     [ ! -e /data/proj_pub/.tilbot-storage-ready ] &&
     [ ! -e /data/proj_pub/.tilbot-storage-migrating ]; } ||
   { [ -e /data/proj_pub/.tilbot-storage-ready ] &&
     [ ! -e /data/projects/.tilbot-storage-ready ] &&
     [ ! -e /data/projects/.tilbot-storage-migrating ]; }; then
  echo "A project volume is missing its migration state; restore the volume before starting" >&2
  exit 1
fi

for destination in /data/projects /data/proj_pub; do
  if [ ! -e "$destination/.tilbot-storage-ready" ] && [ ! -e "$destination/.tilbot-storage-migrating" ]; then
    touch "$destination/.tilbot-storage-migrating"
  fi
done

migrate() {
  source=$1
  destination=$2
  ready="$destination/.tilbot-storage-ready"
  migrating="$destination/.tilbot-storage-migrating"
  if [ -e "$ready" ]; then
    return
  fi
  cp -a "$source/." "$destination/"
  chown -R --no-dereference node:node "$destination"
  chmod 0700 "$destination"
  mv "$migrating" "$ready"
}

migrate /legacy/projects /data/projects
migrate /legacy/proj_pub /data/proj_pub
