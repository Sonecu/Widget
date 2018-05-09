(function() {

    'use strict';

    var AudioPlayer = function(o) {
        this.init(o);
    };

    AudioPlayer.prototype = {

        init: function(o) {
            var self = this;
            if (!o.idTarget) {
                throw ('missing idTarget. Please consult the documentation.');
            }
            if (!o.tracks || !o.tracks.length) {
                throw ('missing tracks. Please consult the documentation.');
            }
            if (o.walletAddress) {
                if (o.microWalletAddress) {
                    throw ('You listed both microWalletAddress and walletAddress. Please choose one or the other.');
                }
                if (o.lumenBoxAddress) {
                    throw ('You listed both lumenBoxAddress and walletAddress. Please choose one or the other.');
                }
            }
            if (o.microWalletAddress && o.lumenBoxAddress) {
                throw ('You listed both lumenBoxAddress and microWalletAddress. Please choose one or the other.')
            }
            if (o.microWalletAddress) {
                if (/.*\*micro-wallet.com/.test(o.microWalletAddress)) {
                    self.address = o.microWalletAddress;
                    self.usingFederatedAddress = true;
                } else {
                    throw ('invalid microWalletAddress. Please consult the documentation.')
                }
            } else if (o.lumenBoxAddress) {
                if (/.*\*lumenbox.org/.test(o.lumenBoxAddress)) {
                    self.address = o.lumenBoxAddress;
                    self.usingFederatedAddress = true;
                } else {
                    throw ('invalid microWalletAddress. Please consult the documentation.')
                }
            } else {
                if (!o.walletAddress) {
                    throw ('Missing wallet address. Please consult the documentation.')
                }
                self.address = o.walletAddress;
            }

            self.idTarget = '#'.concat(o.idTarget);
            self.tracks = o.tracks;
            self.imageSrc = o.imageSrc || 'http://placekitten.com/1920/1120';
            self.by = o.by || '';
            if (o.walletAddress) {
                if (!o.memo) {
                    throw ('Missing memo. Please consult the documentation');
                }
            }
            self.memo = o.memo;
            self.message = o.message || 'Thanks for the support!';
            self.albumName = o.albumName || '';
            self.useAlbumDisplay = o.useAlbumDisplay || false;
            self.activeTrackIndex = 0;
            self.numTracks = o.tracks.length;

            self._setHtml().then(function() {
                self._setCss();
                self._setJs();
                self._fetchStellarData().then(function(url) {
                    $.get(url, function(data) {
                        var records = data._embedded.records;
                        if (records.length) {
                            $(`${self.idTarget} .stw-audio-player-container .num-supporters`).html(records.length);
                            var lumenAmount = parseInt(records.reduce(function(sum, each) {
                                return sum + each.amount
                            }, 0), 10);
                            $.get(`https://api.coinmarketcap.com/v2/ticker/512/?convert=USD`, function(_data) {
                                $(`${self.idTarget} .stw-audio-player-container .dollar-value`).html((_data.data.quotes.USD.price * lumenAmount).toFixed(2));
                            });
                        }
                    });
                })
            });
        },

        _fetchStellarData: function() {
            var self = this;
            return new Promise(function(resolve) {
                if (self.usingFederatedAddress) {
                    var lumenBoxUrl = `https://lumenbox.org/verify/${self.address}`;
                    $.get(lumenBoxUrl, function(data) {
                        var publicKey = data.record.account_id;
                        var memo = data.record.memo;
                        resolve(`https://api.stellar.expert/api/explorer/public/payments?to=${publicKey}&limit=100&memo=${memo}`);
                    });
                } else {
                    resolve(`https://api.stellar.expert/api/explorer/public/payments?to=${self.address}&limit=100&memo=${self.memo}`);
                }
            })
        },

        _setHtml: function() {
            var self = this;
            return new Promise(function(resolve) {
                $('document').ready(function() {
                    var container = $(
                        "<div class='stw-audio-player-container'>" +
                        "<div class='main'>" +
                        "<audio crossorigin><source src=" + self.tracks[0].url + " type='audio/mpeg'></audio>" +
                        "<div class='content-left'>" +
                        "<img src='" + self.imageSrc + "' alt='' class='image' />" +
                        "</div>" +
                        "<div class='content-right'>" +
                        "<div class='content-top'>" +
                        "<div class='content-top-left'>" +
                        "<div>" +
                        "<div class='support-the-artist-message'>" + self.message + "</div>" +
                        "<div class='album-name'>" + self.albumName + "</div>" +
                        "<div class='song-by'>By " + self.by + "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='content-top-right'>" +
                        "<div class='support-stats'>" +
                        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<svg width=\"8px\" height=\"6px\" viewBox=\"0 0 8 6\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                        "    <title>Path 2</title>\n" +
                        "    <defs></defs>\n" +
                        "    <g id=\"Symbols\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
                        "        <g id=\"social-buttons/mobile\" transform=\"translate(-50.000000, -6.000000)\" stroke=\"#333\">\n" +
                        "            <polyline id=\"Path-2\" points=\"50.5108007 11 54.3266763 7.18412438 57.9275884 10.7850365\"></polyline>\n" +
                        "        </g>\n" +
                        "    </g>\n" +
                        "</svg> " +
                        "<div class='num-supporters'>0</div>&nbsp; | $<span class='dollar-value'>0.00</span></div>" +
                        "<div class='support'>Support</div>" +
                        "<div class='back'>Back</div>" +
                        "<div class='tw-link'>TW</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='content-bottom-support'>" +
                        "<div class='support-label'>Stellar (XLM) Address: <span class='learn'>Learn</span></div><div class='address-value copyable-area'>" + self.address + "</div>" +
                        self._memoHtml() +
                        "</div>" +
                        "<div class='content-bottom'>" +
                        "<div class='loading'>" +
                        "<div class='spinner'></div>" +
                        "</div>" +
                        "<div class='play-pause-btn'>" +
                        "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='24' viewBox='0 0 18 24'>" +
                        "<path fill='#566574' fill-rule='evenodd' d='M18 12L0 24V0' class='play-pause-icon playPause'/>" +
                        "</svg>" +
                        "</div>" +
                        "<div class='song-name-and-slider'>" +
                        "<div class='song-name'>1. " + self.tracks[0].name + "</div>" +
                        "<div class='slider-container'></div>" +
                        "</div>" +
                        "<div class='time-and-forward-backward'>" +
                        "<div>" +
                        "<span class='current-time'>0:00</span> / " +
                        "<span class='total-time'>0:00</span>" +
                        "</div>" +
                        "<div class='forward-backward-btns'>" +
                        "<div class='backward'>" +
                        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<svg width=\"20px\" height=\"30px\" viewBox=\"0 0 56 30\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                        "    <title>Group</title>\n" +
                        "    <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
                        "        <g class='backward-content' fill='" + self._backArrowColor() + "'>\n" +
                        "            <rect id=\"Rectangle-8\" x=\"0\" y=\"0\" width=\"6\" height=\"30\"></rect>\n" +
                        "            <polygon id=\"Triangle\" transform=\"translate(18.000000, 15.000000) rotate(270.000000) translate(-18.000000, -15.000000) \" points=\"18 2 33 28 3 28\"></polygon>\n" +
                        "            <polygon id=\"Triangle\" transform=\"translate(43.000000, 15.000000) rotate(270.000000) translate(-43.000000, -15.000000) \" points=\"43 2 58 28 28 28\"></polygon>\n" +
                        "        </g>\n" +
                        "    </g>\n" +
                        "</svg>" +
                        "</div>" +
                        "<div class='forward'>" +
                        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<svg width=\"20px\" height=\"30px\" viewBox=\"0 0 56 30\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                        "    <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
                        "        <g class='forward-content' fill='" + self._forwardArrowColor() + "'>" +
                        "            <rect id=\"Rectangle-8\" x=\"0\" y=\"0\" width=\"6\" height=\"30\"></rect>\n" +
                        "            <polygon id=\"Triangle\" transform=\"translate(18.000000, 15.000000) rotate(270.000000) translate(-18.000000, -15.000000) \" points=\"18 2 33 28 3 28\"></polygon>\n" +
                        "            <polygon id=\"Triangle\" transform=\"translate(43.000000, 15.000000) rotate(270.000000) translate(-43.000000, -15.000000) \" points=\"43 2 58 28 28 28\"></polygon>\n" +
                        "        </g>\n" +
                        "    </g>\n" +
                        "</svg>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        self._getAlbumHtml() +
                        "</div>"
                    );
                    const idTarget = self.idTarget;
                    $(idTarget).append(container);
                    resolve(null);
                });
            })
        },

        _memoHtml: function() {
            var self = this;
            return self.usingFederatedAddress ? '' : "<div class='support-label'>Memo:</div><div class='memo-value copyable-area'>" + self.memo + "</div>";
        },

        _hasTracksGoingForward: function() {
            return this.activeTrackIndex < (this.numTracks - 1);
        },

        _hasTracksGoingBackward: function() {
            return this.activeTrackIndex > 0;
        },

        _backArrowColor: function() {
            var self = this;
            return self._hasTracksGoingBackward() ? '#333' : '#888';
        },

        _forwardArrowColor: function() {
            var self = this;
            return self._hasTracksGoingForward() ? '#333' : '#888';
        },

        _songOptions: function() {
            var self = this;
            var songOptions = '';
            let className;
            for (var i = 0; i < self.tracks.length; i++) {
                songOptions += '<div class="song-option-container"><div index="' + i + '" title="' + self.tracks[i].name + '" value="' + self.tracks[i].url + '" class="mini-play-pause-btn">' + "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='18' viewBox='0 0 18 24'>" +
                    "<path fill='#566574' fill-rule='evenodd' d='M18 12L0 24V0' class='play-pause-icon-mini playPauseMini'/>" +
                    "</svg>" +
                    "</div>" + '<div index="' + i + '" title="' + self.tracks[i].name + '" value="' + self.tracks[i].url + '" class="song-option">' + (i + 1) + '. ' + self.tracks[i].name + '</div></div>'
            }
            return songOptions;
        },

        _getAlbumHtml: function() {
            var self = this;
            if (self.useAlbumDisplay) {
                return "<div class='song-options'>" + self._songOptions() + "</div>";
            }
            return "<div></div>";
        },

        _setCss: function() {
            var self = this;

            $(`${self.idTarget} .stw-audio-player-container`).css({
                'font-family' : 'Roboto, sans-serif',
                'border': '1px solid #c7c7c7',
                'max-width' : '40em',
                'min-width': '31em',
                'line-height': '1',
                'box-shadow' : '0 4px 16px 0 rgba(0, 0, 0, .07)',
                'background-color' : '#fff',
                'text-align': 'left'
            });

            $(`${self.idTarget} .stw-audio-player-container .main`).css({
                'width': '100%',
                'height' : '6.4em',
                'line-height': '1',
                'display': 'flex'
            });

            $(`${self.idTarget} .stw-audio-player-container loading`).css({
                'padding-top': '1em',
                'padding-left:': '1.6em',
                'padding-right': '1.6em'
            });

            $(`${self.idTarget} .stw-audio-player-container .learn`).css({
                'font-weight': '500',
                'color': '#35518d',
                'cursor': 'pointer',
                'user-select': 'all'
            })

            $(`${self.idTarget} .stw-audio-player-container .image`).css({
                'max-width' : '6.4em',
                'width': '6.4em',
                'height': '100%',
                'max-height': '100%',
                'object-fit' : 'cover'
            });

            $(`${self.idTarget} .song-option-container`).css({
                'display': 'flex'
            });

            $(`${self.idTarget} .stw-audio-player-container .copyable-area`).css({
                'background': '#e4e4e4',
                'padding': '0.2em 0.6em',
                'display': 'inline-grid',
                'margin-bottom': '0.3em'
            });

            $(`${self.idTarget} .mini-play-pause-btn`).css({
                'border': '1px solid rgb(217, 217, 217)',
                'width': '1.3em',
                'height': '1.3em',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'margin-right': '0.3em',
                'cursor': 'pointer'
            });

            $(`${self.idTarget} .stw-audio-player-container .support-the-artist-message`).css({
                'color': '#333',
                'display': 'none',
                'font-size': '0.8em',
                'margin-bottom': '1em',
                'font-style': 'italic'
            });

            $(`${self.idTarget} .song-options`).css({
                'padding': '0.5em 0.7em',
                'font-size': '0.8em',
                'line-height': '1.6',
                'margin': '0',
                'color': '#333',
                'border-top': '1px solid rgb(231, 231, 231)'
            });

            $(`${self.idTarget} .stw-audio-player-container .address`).css({
                'font-size': '14px',
                'color': '#556473',
                'margin-left': '42px',
                'padding-top': '18px',
                'display': 'none',
                'word-wrap': 'break-word',
                'margin-right': '30px',
                'position': 'absolute',
                'width': '320px'
            });

            $(`${self.idTarget} .stw-audio-player-container .content-bottom`).css({
                'display': 'inline-flex',
                'margin-left': '0.7em',
                'margin-top': '0.7em'
            });

            $(`${self.idTarget} .stw-audio-player-container .content-top-right`).css({
                'display': 'flex',
                'margin-right': '1em',
                'font-size': '0.8em'
            });

            $(`${self.idTarget} .stw-audio-player-container .song-name-and-slider`).css({
                'margin-top': '0.6em',
                'margin-left': '1em',
                'margin-right': '1em',
                'width': '100%',
                'font-size': '0.7em'
            });

            $(`${self.idTarget} .stw-audio-player-container .time-and-forward-backward`).css({
                'width': '8em',
                'font-size': '0.7em',
                'color': '#7f7f7f'
            });

            $(`${self.idTarget} .stw-audio-player-container .content-bottom-support`).css({
                'font-size': '0.8em',
                'color': '#333',
                'display': 'none',
                'flex-direction': 'column',
                'justify-content': 'center',
                'margin-left': '0.8em',
                'margin-right': '0.8em'
            });

            $(`${self.idTarget} .stw-audio-player-container .support-label`).css({
                'font-size': '0.7em',
                'font-weight': '500',
                'user-select': 'none',
                'margin-bottom': '0.2em'
            });

            $(`${self.idTarget} .stw-audio-player-container .forward-backward-btns`).css({
                'display': 'flex'
            });

            $(`${self.idTarget} .stw-audio-player-container .forward`).css({
                'margin-left': '0.7em',
                'transform': 'rotate(180deg)'
            });

            $(`${self.idTarget} .stw-audio-player-container .memo`).css({
                'font-size': '14px',
                'color': '#556473',
                'position': 'absolute',
                'margin-top': '55px',
                'margin-left': '42px'
            });

            $(`${self.idTarget} .stw-audio-player-container .slider-container`).css({
                'width': '100%',
                'margin-top': '0.8em'
            });

            $(`${self.idTarget} .stw-audio-player-container .content-right`).css({
                'display': 'flex',
                'flex-direction': 'column',
                'width': '100%'
            });

            $(`${self.idTarget} .stw-audio-player-container .support`).css({
                'color': '#35518d',
                'display': 'table',
                'font-weight': '600',
                'margin-right': '0.5em',
                'padding-left': '0.5em',
                'padding-right': '0.5em',
                'border-radius': '0.2em',
                'cursor': 'pointer'
            });

            $(`${self.idTarget} .stw-audio-player-container .back`).css({
                'display': 'none',
                'color': '#35518d',
                'font-weight': '600',
                'margin-right': '0.5em',
                'padding-left': '0.5em',
                'padding-right': '0.5em',
                'border-radius': '0.2em',
                'cursor': 'pointer'
            })

            $(`${self.idTarget} .stw-audio-player-container .num-supporters`).css({
                'margin-left': '0.3em'
            });

            $(`${self.idTarget} .stw-audio-player-container .support-stats`).css({
                'color': '#333',
                'margin-right': '0.5em',
                'display': 'inline-flex',
                'align-items': 'baseline'
            });

            $(`${self.idTarget} .stw-audio-player-container .tw-link`).css({
                'color': '#333'
            })

            $(`${self.idTarget} .stw-audio-player-container .tip`).css({
                'font-size': '12px',
                'margin-top': '5px',
                'color': '#556473',
                'display': 'flex',
                'justify-content': 'space-between',
                'margin-left': '42px'
            });

            $(`${self.idTarget} .stw-audio-player-container .tip-btn`).css({
                'cursor': 'pointer',
                'border-radius': '3px',
                'padding': '1px 5px',
                'background': '#4ad5b6',
                'box-shadow' : '0px 1px 1px 0px rgba(0, 0, 0, 0.32)'
            });

            $(`${self.idTarget} .stw-audio-player-container .back-btn`).css({
                'display': 'none',
                'margin-left': '322px',
                'cursor': 'pointer',
                'border-radius': '3px',
                'padding': '1px 5px',
                'background': '#43c7ab',
                'box-shadow' : '0px 1px 1px 0px rgba(0, 0, 0, 0.32)'
            });

            $(`${self.idTarget} .stw-audio-player-container .content-top`).css({
                'margin-left': '0.7em',
                'padding-top': '0.7em',
                'font-size': '0.8em',
                'display': 'flex',
                'justify-content': 'space-between'
            });

            $(`${self.idTarget} .stw-audio-player-container .tip-explanation`).css({
                'font-size': '10px',
                'position': 'absolute',
                'margin-left': '42px',
                'margin-top': '5px',
                'color': '#556473',
                'font-style': 'italic',
                'user-select': 'none',
                'display': 'none'
            })


            $(`${self.idTarget} .stw-audio-player-container .album-name`).css({
                'color': '#333',
                'font-weight': '600'
            });

            $(`${self.idTarget} .stw-audio-player-container .song-by`).css({
                'color': '#333',
                'margin-top': '0.3em'
            });

            $(`${self.idTarget} .stw-audio-player-container .address-title`).css({
                'user-select': 'none',
                'font-weight': '800'
            });

            $(`${self.idTarget} .stw-audio-player-container .memo-title`).css({
                'user-select': 'none',
                'font-weight': '800'
            });

            $(`${self.idTarget} .stw-audio-player-container .memo`).css({
                'display': 'none'
            });

            $(`${self.idTarget} .stw-audio-player-container .play-pause-btn`).css({
                'cursor' : 'pointer',
                'border': '1px solid #d9d9d9',
                'display': 'none',
                'width': '3.5em',
                'height': '2.5em',
                'align-items': 'center',
                'justify-content': 'center'
            });

            $(`${self.idTarget} .stw-audio-player-container .spinner`).css({
                'width' : '18px',
                'height' : '18px',
                'background-image' : 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/355309/loading.png)',
                'background-size' : 'cover',
                'background-repeat' : 'no-repeat',
                'animation' : 'spin 0.4s linear infinite'
            });

            $(`${self.idTarget} .stw-audio-player-container .controls span`).css({
                'cursor' : 'default'
            });

            $(`${self.idTarget} .stw-audio-player-container svg, ${self.idTarget} .stw-audio-player-container svg img`).css({
                'display' : 'block'
            });

            try {
                $.keyframe.define([{
                    name: 'spin',
                    from: {
                        'transform': 'rotateZ(0)'
                    },
                    to: {
                        'transform': 'rotateZ(1turn)'
                    }
                }])
            } catch(err) {
                // don't do anything
            }
        },

        _addJqueryUiCss: function() {

            $('.ui-slider').css({
                'position' : 'relative',
                'text-align' : 'left'
            });

            $('.ui-slider .ui-slider-handle').css({
                'position' : 'absolute',
                'z-index' : '2',
                'width' : '1.2em',
                'height' : '1.2em',
                'cursor' : 'default',
                '-ms-touch-action' : 'none',
                'touch-action' : 'none'
            });

            $('.ui-slider .ui-slider-range').css({
                'position' : 'absolute',
                'z-index' : '1',
                'font-size' : '.7em',
                'display' : 'block',
                'border' : '0',
                'background-position' : '0 0'
            });

            $('.ui-slider.ui-state-disabled .ui-slider-handle, .ui-slider.ui-state-disabled .ui-slider-range').css({
                'filter' : 'inherit'
            });

            $('.ui-slider-horizontal').css({
                'height' : '0'
            });

            $('.ui-slider-horizontal .ui-slider-handle').css({
                'top' : '-.65em',
                'margin-left' : '-.6em'
            });

            $('.ui-slider-horizontal .ui-slider-range').css({
                'top' : '0',
                'height' : '100%'
            });

            $('.ui-slider-horizontal .ui-slider-range-min').css({
                'left' : '0'
            });

            $('.ui-slider-horizontal .ui-slider-range-max').css({
                'right' : '0'
            });

            $('.ui-slider-vertical').css({
                'width' : '.8em',
                'height' : '100px'
            });

            $('.ui-slider-vertical .ui-slider-handle').css({
                'left' : '-.3em',
                'margin-left' : '0',
                'margin-bottom' : '-.6em'
            });

            $('.ui-slider-vertical .ui-slider-range').css({
                'left' : '0',
                'width' : '100%'
            });

            $('.ui-slider-vertical .ui-slider-range-min').css({
                'bottom' : '0'
            });

            $('.ui-slider-vertical .ui-slider-range-max').css({
                'top' : '0'
            });

            $('.ui-widget.ui-widget-content').css({
                'border' : '1px solid #c5c5c5'
            });

            $('.ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default, .ui-button').css({
                'border' : '1px solid #4ad5b6',
                'background' : '#4ad5b6',
                'outline' : 'none'
            });

            $('.ui-slider-handle').css({
                'border-radius' : '50%'
            });
        },

        _setJs: function() {
            var self = this;

            self.audioPlayer = document.querySelector(`${self.idTarget} .stw-audio-player-container`);
            self.playPause = self.audioPlayer.querySelector(`.playPause`);
            self.playpauseBtn = self.audioPlayer.querySelector(`.play-pause-btn`);
            self.loading = self.audioPlayer.querySelector(`.loading`);
            self.progress = self.audioPlayer.querySelector(`.progress`);
            self.sliders = self.audioPlayer.querySelectorAll(`.slider`);
            self.volumeBtn = self.audioPlayer.querySelector(`.volume-btn`);
            self.player = self.audioPlayer.querySelector(`audio`);
            self.currentTime = self.audioPlayer.querySelector(`.current-time`);
            self.totalTime = self.audioPlayer.querySelector(`.total-time`);
            self.tipBtn = document.querySelector(`${self.idTarget} .stw-audio-player-container .support`);
            self.backBtn = document.querySelector(`${self.idTarget} .stw-audio-player-container .back`);
            self.sliderContainer = $(`${self.idTarget} .slider-container`);

            self.draggableClasses = ['pin'];
            self.currentlyDragged = null;
            $( function() {
                // setup master volume
                $(self.sliderContainer).slider({
                    value: 0,
                    orientation: "horizontal",
                    range: "min",
                    animate: false,
                    slide: function (ev, ui) {
                        self.player.currentTime = self.player.duration * (ui.value / 100);
                    }
                });
                self._addJqueryUiCss();

            } );
            self._songOptions = self._songOptions.bind(self);
            self.togglePlay = self.togglePlay.bind(self);
            self.updateProgress = self.updateProgress.bind(self);
            self.makePlay = self.makePlay.bind(self);

            if (self.numTracks > 1) {
                $(`${self.idTarget} .forward`).css({'cursor': 'pointer'})
            }
            $(`${self.idTarget} .forward`).on('click', function() {
                if (self._hasTracksGoingForward()) {
                    if (self.useAlbumDisplay) {
                        self.miniPlayPauseBtns[self.activeTrackIndex + 1].click();
                    } else {
                        self.activeTrackIndex += 1;
                        self.player.src = self.tracks[self.activeTrackIndex].url;
                        $(`${self.idTarget} .song-name`).html(`${self.activeTrackIndex + 1}. ${self.tracks[self.activeTrackIndex].name}`);
                        if (!(self.numTracks > self.activeTrackIndex + 1)) {
                            $(`${self.idTarget} .forward-content`).css({'fill': '#888', 'cursor': 'initial'});
                            $(`${self.idTarget} .backward-content`).css({'fill': '#333', 'cursor': 'pointer'});
                        }
                        self.playpauseBtn.click();
                    }
                }
            });

            $(`${self.idTarget} .backward`).on('click', function() {
                if (self._hasTracksGoingBackward()) {
                    if (self.useAlbumDisplay) {
                        self.miniPlayPauseBtns[self.activeTrackIndex - 1].click();
                    } else {
                        self.activeTrackIndex -= 1;
                        self.player.src = self.tracks[self.activeTrackIndex].url;
                        $(`${self.idTarget} .song-name`).html(`${self.activeTrackIndex + 1}. ${self.tracks[self.activeTrackIndex].name}`);
                        if (self.activeTrackIndex - 1 < 0) {
                            $(`${self.idTarget} .backward-content`).css({'fill': '#888', 'cursor': 'initial'});
                            $(`${self.idTarget} .forward-content`).css({'fill': '#333', 'cursor': 'pointer'});
                        }
                        self.playpauseBtn.click();
                    }

                }
            });

            $(`${self.idTarget} .mini-play-pause-btn`).on('click', function(e) {
                let node = e.target;
                if (!e.target.attributes.index) {
                    if (e.target.parentNode.attributes.index) {
                        node = e.target.parentNode;
                    } else {
                        node = e.target.parentNode.parentNode;
                    }
                }
                const newTrackIndex = parseInt(node.attributes.index.value, 10)
                if (self.activeTrackIndex !== newTrackIndex) {
                    self.player.src = node.attributes.value.value;
                    $(`${self.idTarget} .song-name`).html(`${parseInt(node.attributes.index.value, 10) + 1}. ${node.title}`);
                    self.activeTrackIndex = newTrackIndex;
                }
                self.playpauseBtn.click();

                if (!(self.numTracks > self.activeTrackIndex + 1)) {
                    setTimeout(function() {
                        // TODO: Figure out why not updating on the original stack.
                        $(`${self.idTarget} .forward-content`).css({'fill': '#888', 'cursor': 'initial'});
                        $(`${self.idTarget} .backward-content`).css({'fill': '#333', 'cursor': 'pointer'});
                    }, 0)
                }
                if (self.activeTrackIndex - 1 < 0) {
                    setTimeout(function() {
                      $(`${self.idTarget} .backward-content`).css({'fill': '#888', 'cursor': 'initial'});
                      $(`${self.idTarget} .forward-content`).css({'fill': '#333', 'cursor': 'pointer'});
                    }, 0);
                }

            });
            // self.allPlayPauseBtns.addEventListener('click', self.pauseAll)
            self.playpauseBtn.addEventListener('click', self.togglePlay);
            self.player.addEventListener('timeupdate', self.updateProgress);
            self.player.addEventListener('loadedmetadata', function() {
                self.totalTime.textContent = self.formatTime(self.player.duration);
            });
            self.player.addEventListener('canplay', self.makePlay);
            self.player.addEventListener('ended', function(){
                self.playPause.attributes.d.value = "M18 12L0 24V0";
                self.player.currentTime = 0;
            });

            if (self.tracks.length > 1) {
                self.miniPlayPauseBtns = self.audioPlayer.querySelectorAll('.mini-play-pause-btn');
            }

            self.tipBtn.addEventListener('click', function() {
                $(`${self.idTarget} .stw-audio-player-container .album-name`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .song-by`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .content-bottom`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .support`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .content-left`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .support-stats`).css('display', 'none');

                $(`${self.idTarget} .stw-audio-player-container .back`).css('display', 'table');
                $(`${self.idTarget} .stw-audio-player-container .content-bottom-support`).css('display', 'inline-flex');
                $(`${self.idTarget} .stw-audio-player-container .support-the-artist-message`).css('display', 'block');
            });
            self.backBtn.addEventListener('click', function() {
                $(`${self.idTarget} .stw-audio-player-container .support-the-artist-message`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .back`).css('display', 'none');
                $(`${self.idTarget} .stw-audio-player-container .content-bottom-support`).css('display', 'none');

                $(`${self.idTarget} .stw-audio-player-container .support-stats`).css('display', 'inline-flex');
                $(`${self.idTarget} .stw-audio-player-container .content-left`).css('display', 'block');
                $(`${self.idTarget} .stw-audio-player-container .album-name`).css('display', 'block');
                $(`${self.idTarget} .stw-audio-player-container .song-by`).css('display', 'block');
                $(`${self.idTarget} .stw-audio-player-container .content-bottom`).css('display', 'inline-flex');
                $(`${self.idTarget} .stw-audio-player-container .support`).css('display', 'table');
            });

        },

        togglePlay: function() {
            var self = this;
            const pauseIcon = 'M18 12L0 24V0';
            if(self.player.paused) {
                const val = 'M0 0h6v24H0zM12 0h6v24h-6z';
                self.playPause.attributes.d.value = val;
                self.player.play();
                if (self.useAlbumDisplay) {
                    self.miniPlayPauseBtns[self.activeTrackIndex].children[0].children[0].attributes.d.value = val;
                    self.miniPlayPauseBtns.forEach(function(btn, index) {
                        if (index !== self.activeTrackIndex) {
                            btn.children[0].children[0].attributes.d.value = pauseIcon;
                        }
                    })
                }
            } else {
                self.playPause.attributes.d.value = pauseIcon;
                self.player.pause();
                if (self.useAlbumDisplay) {
                    self.miniPlayPauseBtns[self.activeTrackIndex].children[0].children[0].attributes.d.value = pauseIcon;
                }
            }
        },

        updateProgress: function() {
            var self = this;
            var current = self.player.currentTime;
            var percent = (current / self.player.duration) * 100;
            self.sliderContainer.slider({
                value: percent
            })
            self.currentTime.textContent = self.formatTime(current);
        },

        formatTime: function(time) {
            var min = Math.floor(time / 60);
            var sec = Math.floor(time % 60);
            return min + ':' + ((sec<10) ? ('0' + sec) : sec);
        },

        makePlay: function() {
            var self = this;
            self.playpauseBtn.style.display = 'inline-flex';
            self.loading.style.display = 'none';
        },

    };

    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return {
                AudioPlayer: AudioPlayer
            };
        });
    }
    // Add support for CommonJS libraries such as browserify.
    if (typeof exports !== 'undefined') {
        exports.AudioPlayer = AudioPlayer;
    }
    // Define globally in case AMD is not available or unused.
    if (typeof window !== 'undefined') {
        window.AudioPlayer = AudioPlayer;
    } else if (typeof global !== 'undefined') { // Add to global in Node.js (for testing, etc).
        global.AudioPlayer = AudioPlayer;
    }

})();
