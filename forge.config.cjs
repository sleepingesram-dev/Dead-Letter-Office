module.exports = {
  packagerConfig: {
    asar: true,
    executableName: "dead-letter-office",
    appBundleId: "com.sleepingesram.deadletteroffice",
    appCategoryType: "public.app-category.games",
    name: "Dead Letter Office",
    ignore: [
      /^\/\.git($|\/)/,
      /^\/\.github($|\/)/,
      /^\/docs($|\/)/,
      /^\/tests($|\/)/,
      /^\/out($|\/)/,
      /^\/README\.md$/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        name: "DeadLetterOffice",
        authors: "sleepingesram-dev",
        description: "A dark narrative job-sim about sorting undeliverable mail from a town that should not exist."
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32", "linux", "darwin"]
    },
    {
      name: "@electron-forge/maker-deb",
      platforms: ["linux"],
      config: {
        options: {
          maintainer: "sleepingesram-dev",
          homepage: "https://sleepingesram-dev.github.io/Dead-Letter-Office/",
          categories: ["Game"]
        }
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      platforms: ["linux"],
      config: {
        options: {
          homepage: "https://sleepingesram-dev.github.io/Dead-Letter-Office/",
          categories: ["Game"]
        }
      }
    }
  ]
};
