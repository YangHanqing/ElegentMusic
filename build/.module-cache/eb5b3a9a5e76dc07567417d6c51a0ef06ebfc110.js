var nowMusicListName = '优雅音乐';
var MusicBox = React.createClass({displayName: "MusicBox",
    handleSelectList: function (nowSongList,listName) {
        this.setState({ 
            nowSongList: nowSongList, 
            nowMusicIndex: 0,
            nowPlayingListName:listName
        })
    },
    getInitialState: function () {
        return {
            nowMusic: {},
            nowSongList: [],
            playList: [],
            nowPlayingListName: '优雅音乐',
            nowMusicIndex: 0
        }
    },
    componentDidMount: function () {
        let t = this;
        chrome.extension.sendRequest({ greeting: "getNowPlayingInfo" }, function (response) {
            console.log(response.farewell);
            if (response.farewell == 'success') {
                let playList = response.playList;
                let nowPlayingListName = response.nowPlayingListName;
                let nowSongList = response.nowPlayingSongList;
                let nowPlayingSongIndex = response.nowPlayingSongIndex;
                let nowPlayingState = response.nowPlayingState;

                if (nowPlayingSongIndex > 0) {
                    nowMusic = nowSongList[nowPlayingSongIndex - 1];
                }

                t.setState({
                    nowMusic: nowMusic,
                    nowSongList: nowSongList,
                    playList: playList,
                    nowPlayingListName: nowMusicListName,
                    nowMusicIndex: nowPlayingSongIndex
                })
            }
        });
    },
    render: function () {
        return (
            React.createElement("div", {className: "musicBox"}, 
                React.createElement(TitleBar, {nowPlayingListName: this.state.nowPlayingListName}), 
                React.createElement(PlayLists, {onSelectList: this.handleSelectList, playList: this.state.playList}), 
                React.createElement(SongsList, {nowSongList: this.state.nowSongList, nowMusicIndex: this.state.nowMusicIndex}), 
                React.createElement(PlayBar, {nowMusic: this.state.nowMusic})
            )
        )
    }
});

var TitleBar = React.createClass({displayName: "TitleBar",
    render: function () {
        return (
            React.createElement("header", {className: "bar bar-nav"}, 
                React.createElement("a", {href: "#myPopover"}, 
                    React.createElement("h1", {className: "title"}, 
                        this.props.nowPlayingListName, 
                        React.createElement("span", {className: "icon icon-caret"})
                    )
                )
            )
        )
    }
});

var PlayLists = React.createClass({displayName: "PlayLists",
    render: function () {
        var onSelectList = this.props.onSelectList;
        var playListsNodes = this.props.playList.map(function (list) {
            return (
                React.createElement(ListItem, {onSelectList: onSelectList, listName: list})
            )
        })

        return (
            React.createElement("div", {id: "myPopover", className: "popover"}, 
                React.createElement("header", {className: "bar bar-nav"}, 
                    React.createElement("h1", {className: "title"}, "歌单")
                ), 
                React.createElement("ul", {className: "table-view"}, 
                    playListsNodes
                )
            )
        )
    }
})

var SongsList = React.createClass({displayName: "SongsList",
    render: function () {
        let nowMusicIndex = this.props.nowMusicIndex;
        var nowSongListNodes = this.props.nowSongList.map(function (song) {
            console.log(song)
            return (
                React.createElement(SongItem, {songName: song.name, singer: song.singer, songIndex: song.index, nowMusicIndex: nowMusicIndex})
            )
        })
        return (
            React.createElement("div", {className: "content"}, 
                React.createElement("ul", {className: "table-view"}, 
                    nowSongListNodes, 
                    React.createElement("li", null, React.createElement("br", null)), 
                    React.createElement("li", null, React.createElement("br", null))
                )
            )
        )
    }
})

var PlayBar = React.createClass({displayName: "PlayBar",
    render: function () {
        return (
            React.createElement("nav", {id: "playBarNav", className: "bar bar-tab"}, 
                React.createElement("div", {id: "playingSongName", className: "media-body"}, 
                    this.props.nowMusic.name, 
                    React.createElement("p", null, "  ", this.props.nowMusic.singer, " ")
                ), 
                React.createElement("span", {className: "icon icon-play"}), 
                React.createElement("span", {className: "icon icon-forward"})
            )
        )
    }
})


var SongItem = React.createClass({displayName: "SongItem",
    render: function () {
        return (
            React.createElement("li", {className: "table-view-cell songLi"}, 
                React.createElement("div", {className: "songItem"}, 
                    (this.props.songIndex == this.props.nowMusicIndex) ? React.createElement("div", {className: "isPlaying"}) : React.createElement("div", {className: "isnotPlaying"}), 
                    React.createElement("div", {className: "nameItem"}, 
                        this.props.songName, 
                        React.createElement("p", null, " ", this.props.singer, " "), 
                        React.createElement("p", {className: "hide"}, " ", this.props.songIndex, " ")
                    )
                )
            )
        )
    }
})

var ListItem = React.createClass({displayName: "ListItem",
    handleClick: function () {
        let onSelectList = this.props.onSelectList;
        let listName=this.props.listName 
        chrome.extension.sendRequest({ greeting: "getSongsByListName", listName: listName }, function (response) {
            console.log(response.farewell);
            if (response.farewell == 'success') {
                let playList = response.songList;
                console.log(playList)
                onSelectList(playList,listName);
            }
        });
        return;
    },
    render: function () {
        return (
            React.createElement("li", {onClick: this.handleClick.bind(this), className: "table-view-cell"}, this.props.listName)
        )
    }
})

ReactDOM.render(
    React.createElement(MusicBox, null),
    document.getElementById('musicBox')
);