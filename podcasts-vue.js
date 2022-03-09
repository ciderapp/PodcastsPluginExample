// Components

Vue.component('pdpodcast-episode', {
    /*html*/
    template: `
    <div class="cd-mediaitem-list-item list-flat" :class="{'mediaitem-selected': isselected}">
        <div class="info-rect" :style="{'padding-left':'16px'}">
            <div class="title text-overflow-elipsis">
                {{ item.attributes.name }}
            </div>
            <div class="subtitle text-overflow-elipsis">
                {{ item.attributes.description.standard }}
            </div>
            <div class="subtitle text-overflow-elipsis">
                {{ msToMinSec(item.attributes.durationInMilliseconds) }} • {{ new Date(item.attributes.releaseDateTime).toLocaleString() }}
            </div>
        </div>
    </div>
    `,
    props: ['item', 'isselected'],
    methods: {
        msToMinSec(ms) {
            var minutes = Math.floor(ms / 60000);
            var seconds = ((ms % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }
    }
});
Vue.component('pdpodcast-tab', {
    /*html*/
    template: `
    <div class="cd-mediaitem-list-item list-flat" :class="{'mediaitem-selected': isselected}">
        <div class="artwork">
            <mediaitem-artwork
                    :url="item.attributes.artwork.url"
                    size="50"
                    type="podcast"></mediaitem-artwork>
        </div>
        <div class="info-rect">
            <div class="title text-overflow-elipsis">
                {{ item.attributes.name }}
            </div>
        </div>
    </div>
`,
    props: ['item', 'isselected'],
    methods: {}
});


// Page

Vue.component('plugin.podcast-ui', {
    /*html*/
    template: `
        <div class="content-inner podcasts-page">
        <div class="podcasts-list">
            <div class="podcasts-search">
                <div class="search-input-container" style="width:100%;">
                    <div class="search-input--icon"></div>
                    <input type="search" style="width:100%;" spellcheck="false"
                        :placeholder="$root.getLz('term.search') + '...'" @change="searchPodcasts();librarySearch()"
                        v-model="search.term" class="search-input">
                </div>
            </div>
            <div v-if="search.term == ''">
                <div class="podcast-list-header" v-if="ciderPodcasts.length != 0">
                    {{$root.getLz('podcast.followedOnCider')}}
                </div>
                <div class="podcast-list-header" v-if="podcasts.length != 0">
                    {{$root.getLz('podcast.subscribedOnItunes')}}
                </div>
                <pdpodcast-tab :isselected="podcastSelected.id == podcast.id" @click.native="selectPodcast(podcast)"
                    v-for="podcast in podcasts" :item="podcast"></pdpodcast-tab>
            </div>
            <div v-else>
                <div class="podcast-list-header" v-if="podcasts.length != 0">
                    {{$root.getLz('term.library')}}
                </div>
                <pdpodcast-tab :isselected="podcastSelected.id == podcast.id" @click.native="selectPodcast(podcast)"
                    v-for="podcast in search.resultsLibrary" :item="podcast"></pdpodcast-tab>
                <div class="podcast-list-header" v-if="podcasts.length != 0">
                    {{$root.getLz('podcast.itunesStore')}}
                </div>
                <pdpodcast-tab :isselected="podcastSelected.id == podcast.id" @click.native="selectPodcast(podcast)"
                    v-for="podcast in search.results" :item="podcast"></pdpodcast-tab>
            </div>
        </div>
        <div class="episodes-list">
            <div v-if="podcastSelected.id != -1" class="episodes-inline-info">
                <div class="row">
                    <div class="col-auto flex-center">
                        <div class="podcast-artwork">
                            <mediaitem-artwork shadow="large" :url="podcastSelected.attributes.artwork.url" size="300">
                            </mediaitem-artwork>
                        </div>
                    </div>
                    <div class="col podcast-show-info">
                        <h1>{{ podcastSelected.attributes.name }}</h1>
                        <small>{{ podcastSelected.attributes.releaseFrequency }}</small>
                        <small>Created: {{ new Date(podcastSelected.attributes.createdDate).toLocaleDateString() }}</small>
                    </div>
                </div>

                <div class="well podcast-show-description">{{ podcastSelected.attributes.description.standard }}</div>
                <div class="row" v-if="!isSubscribed(podcastSelected.id)">
                    <div class="col">
                        <button class="md-btn md-btn-block">{{$root.getLz('podcast.followOnCider')}}</button>
                    </div>
                    <div class="col">
                        <button class="md-btn md-btn-block">{{$root.getLz('podcast.subscribeOnItunes')}}</button>
                    </div>
                </div>
                <h3>{{$root.getLz('podcast.episodes')}}</h3>
            </div>
            <div v-if="this.search.results.length == 0 && podcastSelected.id == -1" class="podcast-no-search-results">
                <h1 class="titleText">Podcasts on <span class="highlight">Cider</span></h1>
                <h3>{{$root.getLz('error.noResults')}}</h3>
                <p>{{$root.getLz('error.noResults.description')}}</p>
            </div>
            <pdpodcast-episode :isselected="selected.id == episode.id" @dblclick.native="playEpisode(episode)"
                @click.native="selectEpisode(episode)" :item="episode" v-for="episode in episodes"></pdpodcast-episode>
        </div>
        <transition name="wpfade">
            <div class="podcasts-details" v-if="selected.id != -1">
                <div class="podcasts-details-header">
                    <button class="close-btn" @click="selected.id = -1"></button>
                </div>
                <div class="podcast-artwork">
                    <mediaitem-artwork shadow="large" :url="selected.attributes.artwork.url" size="300"></mediaitem-artwork>
                </div>
                <h3 class="podcast-header">{{ selected.attributes.name }}</h3>
                <button @click="playEpisode(selected)"
                    class="md-btn podcast-play-btn">{{$root.getLz('podcast.playEpisode')}}</button>
                <div class="podcast-genre">
                    {{ selected.attributes.genreNames[0] }}
                </div>
                <div class="podcast-metainfo">
                    {{ msToMinSec(selected.attributes.durationInMilliseconds) }} • {{ new
                    Date(selected.attributes.releaseDateTime).toLocaleString() }}
                </div>
                <div class="well podcast-description" v-if="selected.attributes.description.standard">{{
                    selected.attributes.description.standard }}</div>
                <div class="row">
                    <div class="col">
                        <button class="md-btn md-btn-block meta-btn"
                            @click="openUrl(selected.attributes.websiteUrl)">{{$root.getLz('podcast.website')}}</button>
                    </div>
                    <div class="col">
                        <button class="md-btn md-btn-block meta-btn"
                            @click="$root.share(selected.attributes.websiteUrl)">{{$root.getLz('action.share')}}</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
    `,
    data: function () {
        return {
            ciderPodcasts: [],
            podcasts: [],
            episodes: [],
            search: {
                term: "",
                loading: false,
                results: [],
                resultsLibrary: [],
                next: ""
            },
            podcastSelected: {
                id: -1
            },
            selected: {
                id: -1
            }
        }
    },
    async mounted() {
        let podcastShow = await app.mk.api.v3.podcasts(`/v1/me/library/podcasts?include=episodes`)
        this.podcasts = podcastShow.data.data
        if (podcastShow.data.next) {
            await this.getNext(podcastShow.data.next)
        }
        // this.episodes = podcastShow.data.data[0].relationships.episodes.data
    },
    methods: {
        searchTriggerVis(visible) {

        },
        librarySearch() {
            this.search.resultsLibrary = []
            if (this.search.term.length > 2) {
                this.search.resultsLibrary = this.podcasts.filter(podcast => podcast.attributes.name.toLowerCase().includes(this.search.term.toLowerCase()))
            }
        },
        isSubscribed(id) {
            return this.podcasts.filter(podcast => podcast.id == id).length > 0
        },
        searchPodcasts() {
            let self = this
            if(this.search.term == "") {
                return
            }
            app.mk.api.v3.podcasts("/v1/catalog/us/search", {term: this.search.term, types: ["podcasts"], limit: 25}).then(response => {
                console.log(response)
                self.search.results = response.data.results.podcasts.data
            })
        },
        openUrl(url) {
            window.open(url)
        },
        msToMinSec(ms) {
            var minutes = Math.floor(ms / 60000);
            var seconds = ((ms % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        },
        playEpisode(episode) {
            app.mk.setQueue({'episode': episode.id, parameters : {l : app.mklang}}).then(() => {app.mk.play()})
        },
        selectPodcast(podcast) {
            this.podcastSelected = podcast
            this.getEpisodes(podcast)
        },
        selectEpisode(episode) {
            this.selected = Clone(episode)
        },
        async getEpisodes(podcast) {
            this.episodes = []
            let eps = await app.mk.api.v3.podcasts(`/v1/catalog/${app.mk.storefrontId}/podcasts/${podcast.id}?include=episodes`)

            eps.data.data[0].relationships.episodes.data.forEach(ep => {
                this.episodes.push(ep)
            })
            if (eps.data.data[0].relationships.episodes.next) {
                await this.getNextEpisodes(eps.data.data[0].relationships.episodes.next, podcast.id)
            }
        },
        async getNextEpisodes(next, podcastId) {

            let podcastShow = await app.mk.api.v3.podcasts(next)
            if(podcastId != this.podcastSelected.id) {
                return
            }
            podcastShow.data.data.forEach(ep => {
                this.episodes.push(ep)
            })
            if (podcastShow.data.next) {
                await this.getNextEpisodes(podcastShow.data.next, podcastId)
            }
        },
        async getNext(next) {
            let podcastShow = await app.mk.api.v3.podcasts(next)
            this.podcasts = this.podcasts.concat(podcastShow.data.data)
            if (podcastShow.data.next) {
                await this.getNext(podcastShow.data.next)
            }
        }
    }
})