/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ABSPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  host: "",
  library: "",
  token: "",
  folder: "",
  template: ""
};
var ABSPlugin = class extends import_obsidian.Plugin {
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ABSPluginSettingTab(this.app, this));
    const ribbonIconEl = this.addRibbonIcon("book", "ABS", () => {
      new import_obsidian.Notice("Fetching audiobooks...");
      this.fetchAndCreateNotes();
    });
    this.addCommand({
      id: "fetch-books",
      name: "Fetch books and create notes",
      callback: async () => {
        await this.fetchAndCreateNotes();
      }
    });
  }
  async fetchAndCreateNotes() {
    if (!this.settings.host || !this.settings.library || !this.settings.token) {
      new import_obsidian.Notice("Please configure API settings in the ABS Plugin settings.");
      return;
    }
    if (!this.settings.folder) {
      new import_obsidian.Notice("Please configure destination folder in the ABS Plugin settings.");
      return;
    }
    const apiUrl = `https://${this.settings.host}/api/libraries/${this.settings.library}/items?sort=media.metadata.title`;
    try {
      const response = await (0, import_obsidian.request)({
        url: apiUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.settings.token}`
        }
      });
      if (!response) {
        throw new Error(`Failed to fetch books: ${response}`);
      }
      const data = JSON.parse(response);
      const books = (data.results || []).map((book) => {
        var _a;
        return {
          relPath: book.relPath,
          metadata: ((_a = book.media) == null ? void 0 : _a.metadata) || {}
         
        };
      }).sort((a, b) => a.relPath.localeCompare(b.relPath));
      const folder = this.app.vault.getAbstractFileByPath(`${this.settings.folder}`);
      if (!folder) {
        await this.app.vault.createFolder(`${this.settings.folder}`);
      }
      for (const book of books) {
        var metadata = book.metadata;
        var author = metadata.author;
        var authorNameLF = metadata.authorNameLF;
        const sanitizedTitle = metadata.title.replace(/[\/:*?"<>|]/g, "");
        var filePath = "";
        if (book.metadata.seriesName != "") {
          filePath = `${this.settings.folder}/${authorNameLF}/${book.metadata.seriesName.replace(/\s+#\d+$/, "").trim()}/${sanitizedTitle}.md`;
        } else {
          filePath = `${this.settings.folder}/${authorNameLF}/${sanitizedTitle}.md`;
        }
        if (!this.app.vault.getAbstractFileByPath(filePath)) {
          await this.ensureFolderExists(filePath);
          await this.app.vault.create(filePath, JSON.stringify(book, null, 2));
          console.log(`Created: ${filePath}`);
        } else {
          console.log(`Skipped: ${filePath} (Already exists)`);
        }
      }
      new import_obsidian.Notice("Books fetched and notes created successfully!");
    } catch (error) {
      console.error("Error fetching books:", error, " from ", apiUrl);
      new import_obsidian.Notice("Failed to fetch books. Check the console for details.");
    }
  }
  async ensureFolderExists(filePath) {
    const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
    if (!folderPath)
      return;
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
      console.log(`Created folder: ${folderPath}`);
    }
  }
  getBookTemplate(title) {
    return `# ${title}

## Summary

(Add summary here)

## Notes

(Add your notes here)`;
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var ABSPluginSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "ABS Plugin Settings" });
    new import_obsidian.Setting(containerEl).setName("API Host").setDesc("Enter the base URL of the API (without https://)").addText(
      (text) => text.setPlaceholder("example.abs.org").setValue(this.plugin.settings.host).onChange(async (value) => {
        this.plugin.settings.host = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Library").setDesc("Enter the library ID or name").addText(
      (text) => text.setPlaceholder("audiobooks").setValue(this.plugin.settings.library).onChange(async (value) => {
        this.plugin.settings.library = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("API Token").setDesc("Enter your API token").addText(
      (text) => text.setPlaceholder("your-token-here").setValue(this.plugin.settings.token).onChange(async (value) => {
        this.plugin.settings.token = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Folder").setDesc("Where to create pages.").addText(
      (text) => text.setPlaceholder("ABS").setValue(this.plugin.settings.folder).onChange(async (value) => {
        this.plugin.settings.folder = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Template").setDesc("Template for new pages.").addTextArea(
      (text) => text.setPlaceholder("<!--!>").setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value.trim();
        await this.plugin.saveSettings();
      })
    );
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgIHJlcXVlc3QsIE5vdGljZSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbmludGVyZmFjZSBBQlNQbHVnaW5TZXR0aW5ncyB7XG4gIGhvc3Q6IHN0cmluZztcbiAgbGlicmFyeTogc3RyaW5nO1xuICB0b2tlbjogc3RyaW5nO1xuICBmb2xkZXI6IHN0cmluZztcbiAgdGVtcGxhdGU6IHN0cmluZztcbn1cblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQUJTUGx1Z2luU2V0dGluZ3MgPSB7XG4gIGhvc3Q6IFwiXCIsXG4gIGxpYnJhcnk6IFwiXCIsXG4gIHRva2VuOiBcIlwiLFxuICBmb2xkZXI6IFwiXCIsXG4gIHRlbXBsYXRlOiBcIlwiLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQUJTUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IEFCU1BsdWdpblNldHRpbmdzO1xuXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LCBcbiAgICAgIERFRkFVTFRfU0VUVElOR1MsIFxuICAgICAgYXdhaXQgdGhpcy5sb2FkRGF0YSgpXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBBQlNQbHVnaW5TZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICBjb25zdCByaWJib25JY29uRWwgPSB0aGlzLmFkZFJpYmJvbkljb24oXCJib29rXCIsIFwiQUJTXCIsICgpID0+IHtcbiAgICAgIG5ldyBOb3RpY2UoXCJGZXRjaGluZyBhdWRpb2Jvb2tzLi4uXCIpO1xuICAgICAgdGhpcy5mZXRjaEFuZENyZWF0ZU5vdGVzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwiZmV0Y2gtYm9va3NcIixcbiAgICAgIG5hbWU6IFwiRmV0Y2ggYm9va3MgYW5kIGNyZWF0ZSBub3Rlc1wiLFxuICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5mZXRjaEFuZENyZWF0ZU5vdGVzKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hBbmRDcmVhdGVOb3RlcygpIHtcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuaG9zdCB8fCAhdGhpcy5zZXR0aW5ncy5saWJyYXJ5IHx8ICF0aGlzLnNldHRpbmdzLnRva2VuKSB7XG4gICAgICBuZXcgTm90aWNlKFwiUGxlYXNlIGNvbmZpZ3VyZSBBUEkgc2V0dGluZ3MgaW4gdGhlIEFCUyBQbHVnaW4gc2V0dGluZ3MuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuZm9sZGVyKSB7XG4gICAgICBuZXcgTm90aWNlKFwiUGxlYXNlIGNvbmZpZ3VyZSBkZXN0aW5hdGlvbiBmb2xkZXIgaW4gdGhlIEFCUyBQbHVnaW4gc2V0dGluZ3MuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFwaVVybCA9IGBodHRwczovLyR7dGhpcy5zZXR0aW5ncy5ob3N0fS9hcGkvbGlicmFyaWVzLyR7dGhpcy5zZXR0aW5ncy5saWJyYXJ5fS9pdGVtcz9zb3J0PW1lZGlhLm1ldGFkYXRhLnRpdGxlYDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3Qoe1xuICAgICAgICB1cmw6IGFwaVVybCxcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3RoaXMuc2V0dGluZ3MudG9rZW59YCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICBcblxuICAgICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBib29rczogJHtyZXNwb25zZX1gKTtcbiAgICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICBcbiAgICBjb25zdCBib29rcyA9IChkYXRhLnJlc3VsdHMgfHwgW10pXG4gICAgICAubWFwKChib29rOiBhbnkpID0+ICh7XG4gICAgICAgIHJlbFBhdGg6IGJvb2sucmVsUGF0aCxcbiAgICAgICAgbWV0YWRhdGE6IGJvb2subWVkaWE/Lm1ldGFkYXRhIHx8IHt9LCAvLyBFbnN1cmUgbWV0YWRhdGEgZXhpc3RzXG4gICAgICB9KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnJlbFBhdGgubG9jYWxlQ29tcGFyZShiLnJlbFBhdGgpKTsgXG5cbiAgICBjb25zdCBmb2xkZXIgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7dGhpcy5zZXR0aW5ncy5mb2xkZXJ9YCk7XG4gICAgaWYgKCFmb2xkZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihgJHt0aGlzLnNldHRpbmdzLmZvbGRlcn1gKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGJvb2sgb2YgYm9va3MpIHtcbiAgICAgIHZhciBtZXRhZGF0YSA9IGJvb2subWV0YWRhdGE7XG4gICAgICB2YXIgYXV0aG9yID0gbWV0YWRhdGEuYXV0aG9yO1xuICAgICAgdmFyIGF1dGhvck5hbWVMRiA9IG1ldGFkYXRhLmF1dGhvck5hbWVMRjtcblxuICAgICAgY29uc3Qgc2FuaXRpemVkVGl0bGUgPSBtZXRhZGF0YS50aXRsZS5yZXBsYWNlKC9bXFwvOio/XCI8PnxdL2csIFwiXCIpO1xuICAgICAgdmFyIGZpbGVQYXRoID0gXCJcIlxuXG4gICAgICBpZiAoYm9vay5tZXRhZGF0YS5zZXJpZXNOYW1lICE9IFwiXCIpIHtcbiAgICAgICAgZmlsZVBhdGggPSBgJHt0aGlzLnNldHRpbmdzLmZvbGRlcn0vJHthdXRob3JOYW1lTEZ9LyR7Ym9vay5tZXRhZGF0YS5zZXJpZXNOYW1lLnJlcGxhY2UoL1xccysjXFxkKyQvLCBcIlwiKS50cmltKCl9LyR7c2FuaXRpemVkVGl0bGV9Lm1kYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbGVQYXRoID0gYCR7dGhpcy5zZXR0aW5ncy5mb2xkZXJ9LyR7YXV0aG9yTmFtZUxGfS8ke3Nhbml0aXplZFRpdGxlfS5tZGA7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVQYXRoKSkge1xuICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZUZvbGRlckV4aXN0cyhmaWxlUGF0aCk7XG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShmaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoYm9vaywgbnVsbCwgMikpO1xuICAgICAgICBjb25zb2xlLmxvZyhgQ3JlYXRlZDogJHtmaWxlUGF0aH1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTa2lwcGVkOiAke2ZpbGVQYXRofSAoQWxyZWFkeSBleGlzdHMpYCk7XG4gICAgICB9XG4gICAgfVxuICAgICAgbmV3IE5vdGljZShcIkJvb2tzIGZldGNoZWQgYW5kIG5vdGVzIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIGJvb2tzOlwiLCBlcnJvciwgXCIgZnJvbSBcIiwgYXBpVXJsKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJGYWlsZWQgdG8gZmV0Y2ggYm9va3MuIENoZWNrIHRoZSBjb25zb2xlIGZvciBkZXRhaWxzLlwiKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBlbnN1cmVGb2xkZXJFeGlzdHMoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGZvbGRlclBhdGggPSBmaWxlUGF0aC5zdWJzdHJpbmcoMCwgZmlsZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTsgLy8gR2V0IHRoZSBmb2xkZXIgcGF0aFxuICBcbiAgICBpZiAoIWZvbGRlclBhdGgpIHJldHVybjsgLy8gTm8gZm9sZGVyIG5lZWRlZCAoZmlsZSBpcyBpbiByb290KVxuICBcbiAgICBjb25zdCBmb2xkZXIgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZm9sZGVyUGF0aCk7XG4gICAgaWYgKCFmb2xkZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihmb2xkZXJQYXRoKTsgLy8gQ3JlYXRlIHRoZSBtaXNzaW5nIGZvbGRlclxuICAgICAgY29uc29sZS5sb2coYENyZWF0ZWQgZm9sZGVyOiAke2ZvbGRlclBhdGh9YCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Qm9va1RlbXBsYXRlKHRpdGxlKSB7XG4gICAgcmV0dXJuIGAjICR7dGl0bGV9XFxuXFxuIyMgU3VtbWFyeVxcblxcbihBZGQgc3VtbWFyeSBoZXJlKVxcblxcbiMjIE5vdGVzXFxuXFxuKEFkZCB5b3VyIG5vdGVzIGhlcmUpYDtcbiAgfVxuXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG59XG5cbmNsYXNzIEFCU1BsdWdpblNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBBQlNQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwLCBwbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIkFCUyBQbHVnaW4gU2V0dGluZ3NcIiB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJBUEkgSG9zdFwiKVxuICAgICAgLnNldERlc2MoXCJFbnRlciB0aGUgYmFzZSBVUkwgb2YgdGhlIEFQSSAod2l0aG91dCBodHRwczovLylcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiZXhhbXBsZS5hYnMub3JnXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmhvc3QpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaG9zdCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkxpYnJhcnlcIilcbiAgICAgIC5zZXREZXNjKFwiRW50ZXIgdGhlIGxpYnJhcnkgSUQgb3IgbmFtZVwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJhdWRpb2Jvb2tzXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmxpYnJhcnkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubGlicmFyeSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkFQSSBUb2tlblwiKVxuICAgICAgLnNldERlc2MoXCJFbnRlciB5b3VyIEFQSSB0b2tlblwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJ5b3VyLXRva2VuLWhlcmVcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudG9rZW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudG9rZW4gPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJGb2xkZXJcIilcbiAgICAgIC5zZXREZXNjKFwiV2hlcmUgdG8gY3JlYXRlIHBhZ2VzLlwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJBQlNcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sZGVyKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZvbGRlciA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlRlbXBsYXRlXCIpXG4gICAgICAuc2V0RGVzYyhcIlRlbXBsYXRlIGZvciBuZXcgcGFnZXMuXCIpXG4gICAgICAuYWRkVGV4dEFyZWEoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCI8IS0tIT5cIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGVtcGxhdGUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGVtcGxhdGUgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcbiAgfVxufVxuXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQW9FO0FBVXBFLElBQU0sbUJBQXNDO0FBQUEsRUFDMUMsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLEVBQ1QsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsVUFBVTtBQUNaO0FBRUEsSUFBcUIsWUFBckIsY0FBdUMsdUJBQU87QUFBQSxFQUc1QyxNQUFNLGVBQWU7QUFDbkIsU0FBSyxXQUFXLE9BQU87QUFBQSxNQUNyQixDQUFDO0FBQUEsTUFDRDtBQUFBLE1BQ0EsTUFBTSxLQUFLLFNBQVM7QUFBQSxJQUN0QjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sU0FBUztBQUNiLFVBQU0sS0FBSyxhQUFhO0FBRXhCLFNBQUssY0FBYyxJQUFJLG9CQUFvQixLQUFLLEtBQUssSUFBSSxDQUFDO0FBRTFELFVBQU0sZUFBZSxLQUFLLGNBQWMsUUFBUSxPQUFPLE1BQU07QUFDM0QsVUFBSSx1QkFBTyx3QkFBd0I7QUFDbkMsV0FBSyxvQkFBb0I7QUFBQSxJQUMzQixDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FB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
