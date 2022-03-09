class PodcastsPlugin {
    constructor() {
        CiderFrontAPI.StyleSheets.Add("./plugins/podcasts-plugin/stylesheet.less")
        const menuEntry = new CiderFrontAPI.Objects.MenuEntry()
        this.menuEntryId = uuidv4()
        menuEntry.Id = this.menuEntryId
        menuEntry.name = "Podcasts"
        menuEntry.onClick = ()=>{
            app.appRoute("plugin/podcast-ui")
        }
        CiderFrontAPI.AddMenuEntry(menuEntry)
    }
}

new PodcastsPlugin()
