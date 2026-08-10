
console.log(
        '%c/////////////////////////////////////////////////////////////////\n'
        + 'This site has been built using the QGIS plugin Quick Web Viewer\n'
        + 'https://quickwebviewer.org/\n'
        + '/////////////////////////////////////////////////////////////////\n','color:#ff0000');
        
//console.log = function() {}

function stepZoomValues(minz, maxz, val, f, bz){

    /*
    minz: minim zoom
    maxz; maxzoom
    val: ref value
    f: factor
    bz: blindzone

    // l.paint['line-width'] = [
    //     "interpolate",
    //     ["exponential", 2],
    //     ["zoom"],
    //     minz, val * Math.pow(2, minz) /50000,
    //     maxz+this.xz, val * Math.pow(2, (maxz+this.xz)) / 50000
    // ];

    */

    let result =  ['step',[ 'zoom'], 0];
    zs =  Array.from(new Array((maxz-minz)*2), (x, i) => parseFloat(i*0.5 + minz));
    for (zoom in zs){
            result.push(zs[zoom], Math.min( val * Math.pow(2, zs[zoom]) /f, bz) );
    };

    return result;
}
                                        
let ts = '?v=' + new Date().getTime()

//language
Vue.use(VueI18n);
const lgjs = ['en', 'es', 'fr', 'ca'];
let locale = 'en';

if (lgjs.indexOf(navigator.language.split('-')[0]) !=-1 ){
    locale = navigator.language.split('-')[0]
}

const i18n = new VueI18n({
    locale: locale, // set locale
    fallbackLocale: 'en', // set fallback locale
    messages, // set locale messages
});

var app = new Vue({
    el:   '#app',
    i18n: i18n,

    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdi',
        },
        theme: {
            themes: {
                light: {
                    primary: '#000000',
                },
            },
        },
    }),
    
    data: function () {

        return {
            main_page_columns: custom.main_page_columns,
            zoom_on_click : custom.zoom_on_click,
            mouse_buffer: custom.mouse_buffer,
            popup_on_click: custom.popup_on_click,
            popup_on_hover: custom.popup_on_hover,
            layer_show_hide: custom.layer_show_hide,

            debug:false,
            debug_styles: false,
            
            confData: [
                {
                    'n': 'conf',
                    'u': 'conf.json' + ts
                },
            ],
            
            extrabounds:false,
            c_data: {},
            ready: false,
            loading: false,
            currentChapter: -1,
            currentMap: 0,
            type: 'intro',
            maps: {},
            sprites: [],
            sprites_url: 'https://resources.quickwebviewer.org/sprites/',
            map: null,
            layers: [],
            posMenu: 0,
            menuControls: [],
            currentZoom: undefined, 
            atlas_menu: true,
            atlas_legend: [],

            url_project: 'data/',
            status_menu: 'close', // layers, description, close

            page: 0,
            numPages: 0,

            baseurl: window.location.href.split('/').slice(0, -1).join('/'),
            
            // server_test: 'http://test.quickwebviewer.org/_b7/',
            // server_test: 'https://sandbox.300000.eu/conakry/',
            // server_test: 'http://300mil.net/censo/',
            server_test: 'http://127.0.0.1:5500/',

            xz:2,
            dialog:false,
            measures_control: undefined,
            measure_options: {
                lang: {
                    areaMeasurementButtonTitle: 'Measure area',
                    lengthMeasurementButtonTitle: 'Measure length',
                    clearMeasurementsButtonTitle: 'Clear measurements',
                },
                units: 'metric',
                style: {
                    text: {
                        radialOffset: 0.9,
                        letterSpacing: 0.05,
                        color: '#000',
                        haloColor: '#fff',
                        haloWidth: 4,
                    },
                    common: {
                        midPointRadius: 5,
                        midPointColor: '#000',
                        midPointHaloRadius: 1,
                        midPointHaloColor: '#000',
                    },
                    areaMeasurement: {
                        fillColor: '#000',
                        fillOutlineColor: '#000',
                        fillOpacity: 0.01,
                        lineWidth: 2,
                    },
                    lengthMeasurement: {
                        lineWidth: 2,
                        lineColor: "#000000",
                    },
                }
            }
        }
    },

    methods: {

        setLanguage(e){
            i18n.locale = e;
        },
        changeStatus(s) {
            this.status_menu = s;
            this.$nextTick(() => {
                this.resize;
            })
        },
        resize: function () {
            if (this.map) {
                this.map.resize();
            }
        },
        fillMetadata: function (r) {
            for (c in r['chapters']) {
                if (r['chapters'][c]['maps'] != undefined) {
                    r['chapters'][c]['maps'].forEach((map) => {
                        map.layers.forEach((layer) => {
                            if (Object.hasOwn(layer, "maplibreLayers")) {
                                layer.maplibreLayers.forEach((l) => {
                                    if (l.metadata == undefined) {
                                        l['metadata'] = {}
                                    };
                                    if (l.paint!=undefined){
                                        legend_style = JSON.parse(JSON.stringify(l.paint))
                                        if (legend_style['line-width'] != undefined) {
                                            if (typeof (legend_style['line-width']) == 'string' && legend_style['line-width'].toString().indexOf('m') != -1) {
                                                legend_style['line-units'] = 'meters';
                                                legend_style['line-width'] = parseInt(legend_style['line-width'].replace('m', ''));
                                            }
                                        }
                                        if (legend_style['circle-stroke-width'] != undefined) {
                                            if (typeof (legend_style['circle-stroke-width']) == 'string' && legend_style['circle-stroke-width'].toString().indexOf('m') != -1) {
                                                legend_style['circle-units'] = 'meters';
                                                legend_style['circle-stroke-width'] = parseInt(legend_style['circle-stroke-width'].replace('m', ''));
                                            }
                                        }
                                        if (legend_style['circle-radius'] != undefined) {
                                            if (typeof (legend_style['circle-radius']) == 'string' && legend_style['circle-radius'].toString().indexOf('m') != -1) {
                                                legend_style['circle-units'] = 'meters';
                                                legend_style['circle-radius'] = parseFloat(legend_style['circle-radius'].replace('m', ''))/2;
                                            }
                                            else if (Array.isArray(legend_style['circle-radius']) && legend_style['circle-radius'].length == 3 && legend_style['circle-radius'][1].toString().indexOf('m') != -1) {
                                                legend_style['circle-units'] = 'meters';
                                                legend_style['circle-radius'][1] = parseFloat(legend_style['circle-radius'][1].replace('m', ''))/2;
                                            }
                                       }
                                        l.metadata['paint'] = legend_style;
                                    }
                                    l.metadata['layout']  = l.layout;
                                    l.metadata['name'] = layer.name;
                                    l.metadata['minzoom'] = layer.minzoom;
                                    l.metadata['maxzoom'] = layer.maxzoom;
                                    if (layer.legend && layer.legend.legend_status == true) {
                                        l.metadata['legend_status'] = true;
                                    } else {
                                        l.metadata['legend_status'] = false;
                                    }
                                    l.metadata['popup'] = layer['popup'];
                                })
                            }
                        })
                    })
                }
            }
            return r
        },

        checkStyles: function (r) {
            // console.log(this.baseurl, this.server_test)
            if (this.baseurl == 'http://127.0.0.1:5500' || this.baseurl == 'http://localhost:5500') {
                this.baseurl = this.server_test;
            } else {
                this.baseurl = this.baseurl + '/'
            }
            // let sprites=[];
            for (c in r['chapters']) {
                if (r['chapters'][c]['maps'] != undefined) {

                    // substitute baseurl
                    r['chapters'][c]['maps'].forEach((map) => {
                        map.layers.forEach((layer) => {
                            if (layer.source.type === "vector") {
                                if (layer.source.url && layer.source.url.indexOf('{baseurl}') != -1) {
                                    layer.source.url = layer.source.url.replace('{baseurl}', this.baseurl);
                                } else if (layer.source.tiles) {
                                    let tiles = [];
                                    layer.source.tiles.forEach((ss) => {
                                        if (ss.indexOf('{baseurl}') != -1) {
                                            tiles.push(ss.replace('{baseurl}', this.baseurl))
                                        } else {
                                            tiles.push(ss)
                                        }
                                    })
                                    layer.source.tiles = tiles;
                                }
                            }
                            else if (layer.source.type === "raster") {
                                console.log(layer.source.url);
                                if (layer.source.url.indexOf('{baseurl}') != -1) {
                                    layer.source.url = layer.source.url.replace('{baseurl}', this.baseurl);
                                }
                                console.log(layer.source.url);
                            }
                        })
                    });

                    // adapt maplibre styles
                    r['chapters'][c]['maps'].forEach((map) => {
                        let minz = map.minzoom;
                        let maxz = map.maxzoom;
                        map.layers.forEach((layer) => {

                            if (layer.source.type === "vector") {
                                let types = [];
                                layer.maplibreLayers.forEach((l) => {
                                    types.push(l.type);
                                })

                                layer.maplibreLayers.forEach((l) => {
                                    
                                    if (l.paint && l.paint['line-width'] != undefined) {

                                        if (typeof (l.paint['line-width']) == 'string' && l.paint['line-width'].indexOf('m') != -1) {
                                            let val = parseFloat(l.paint['line-width'].replace('m', ''));
                                            if (layer.geometryType == 'Polygon'){
                                                l.paint['line-width'] = stepZoomValues(minz, maxz+this.xz, val, 50000, 20);
                                            }else{
                                                l.paint['line-width'] = stepZoomValues(minz, maxz+this.xz, val, 50000, 512);
                                            }
                                        
                                        }
                                    }
                                    
                                    //empty fill
                                    if (l.paint && l.paint['fill-opacity'] && l.paint['fill-color'] == undefined) {
                                        l.paint['fill-opacity'] = 0;
                                    }

                                    ///markers 
                                    if (l.paint && l.layout && l.layout['icon-image']) {
                                        //this.sprites.push({'id': l.layout['icon-image'], 'url': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png' })
                                        //this.sprites.push({'id':  l.layout['icon-image'], 'url': 'https://urba-conakry.quickwebviewer.org/sprites/'+ l.layout['icon-image'] })
                                        l.layout["icon-overlap"] = "always"
                                    }


                                    /// labels
                                    //"text-font": ["Open Sans Semibold"]

                                    if (l.paint && l.paint['text-font']) {
                                        l.paint['text-font'] = ["Open Sans Semibold"];
                                    }


                                    if (l.paint && l.paint['text-halo-width'] && typeof (l.paint['text-halo-width']) == 'string') {
                                        l.paint['text-halo-width'] = Number(l.paint['text-halo-width']) / 4
                                    }

                                    if (l.paint && l.layout && l.layout['text-size'] && typeof (l.layout['text-size']) == 'number') {
                                        l.layout['text-size'] = l.layout['text-size']/2;
                                    }

                                    //check text offset
                                    if (l.layout != undefined && l.type == 'symbol' && types.indexOf('fill') == -1 && types.indexOf('line') != -1) {
                                        l.layout['symbol-placement'] = 'line';
                                    }

                                    if (l.layout != undefined && l.layout['text-offset'] != undefined) {
                                        if (typeof (l.layout['text-offset']) != 'object') {
                                            l.layout['text-offset'] = [l.layout['text-offset'], l.layout['text-offset']]
                                        }
                                        if (this.debug_styles) {
                                            l.layout = {}
                                        }
                                    }

                                    if (l.paint && l.paint['line-dasharray'] && typeof (l.paint['line-dasharray']) == 'string') {
                                        l.paint['line-dasharray'] = l.paint['line-dasharray'].split(' ');
                                        l.paint['line-dasharray'] = l.paint['line-dasharray'].map((x) => Number(x));
                                    }
                                    if (l.paint && l.paint['line-dasharray']) {
                                        l.paint['line-dasharray'] = l.paint['line-dasharray'].map((x) => x / 4);
                                    }
                                    if (l.paint && l.paint['line-width'] != undefined && l.paint['line-dasharray'] == undefined) {
                                        if (l.layout==undefined){l['layout']={}}
                                        l.layout['line-cap'] ='round';
                                        l.layout['line-join'] = 'round';
                                    }
                                    if (l.paint && l.paint['circle-radius'] && typeof (l.paint['circle-radius']) == 'string' && l.paint['circle-radius'].toString().indexOf('m') != -1){
                                        let val = parseFloat(l.paint['circle-radius'].replace('m', ''))/2
                                        l.paint['circle-radius'] = stepZoomValues(minz, maxz+this.xz, val, 80000, 20);

                                    }else if( Array.isArray(l.paint['circle-radius']) && l.paint['circle-radius'].length == 3 && l.paint['circle-radius'][1].toString().indexOf('m') != -1 ){
                                        let val = parseFloat(l.paint['circle-radius'][1].replace('m', ''));
                                        val = eval(val+l.paint['circle-radius'][0]+l.paint['circle-radius'][2])/2;
                                        l.paint['circle-radius'] = stepZoomValues(minz, maxz+this.xz, val, 40000, 20);

                                    }else if( Array.isArray(l.paint['circle-radius']) && l.paint['circle-radius'].length == 3 && l.paint['circle-radius'][1].toString().indexOf('m') == -1 ){
                                        // en caso de que el circulo tenga una dimension por pantalla
                                    }

                                    if (l.paint && l.paint['circle-stroke-width'] && typeof (l.paint['circle-stroke-width']) == 'string' && l.paint['circle-stroke-width'].indexOf('m') != -1){
                                        let val = parseFloat(l.paint['circle-stroke-width'].replace('m', ''))
                                            l.paint['circle-stroke-width'] = stepZoomValues(minz, maxz+this.xz, val, 80000, 20);
                                    }

                                    // round maplibre zooms (float) to fit tiles (int)
                                    if (l.minzoom != undefined && l.maxzoom != undefined){
                                        l.minzoom = Math.round(l.minzoom);
                                        l.maxzoom = Math.round(l.maxzoom);
                                    }

                                    if (this.debug_styles) {
                                        if (l['type'] == 'fill') {
                                            l['paint'] = {
                                                'fill-color': 'red'
                                            }
                                        } 
                                        else if (l['type'] == 'line') {
                                            l['paint'] = {
                                                'line-color': 'blue'
                                            }
                                        } 
                                        else {
                                            l['paint'] = {
                                                "text-color": "green"
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    })
                }
            }

            return r
        },

        prepareData: function () {
            for (const c in this.confData) {
                fetch(this.url_project + this.confData[c]['u'])
                    .then(res => res.json())
                    .then(r => {

                        if (this.confData[c]['n'] == 'conf') {
                            //r = this.putids(r)
                            r = this.fillMetadata(r)
                            r = this.checkStyles(r)
                            this.c_data[this.confData[c]['n']] = r;
                        } else {
                            this.c_data[this.confData[c]['n']] = r;
                        }
                        if (Object.keys(this.c_data).length == this.confData.length) {
                            this.ready = true
                            this.loading = true
                        }
                    })
            }
        },

        loadChapter: function (c) {

            let el = document.getElementById('mycontent');
            if (c == -1) {
                this.type = 'intro';
                this.currentChapter = c;
            } 
            else if (this.c_data.conf.chapters[c].type == 'md') { //markdown
                this.currentChapter = c;
                this.type = 'md';
            } 
            else if (this.c_data.conf.chapters[c].type == 'pdf') { //pdfviewer
                this.currentChapter = c;
                this.type = 'pdf';
                this.pdf = this.c_data.conf.chapters[c].pdf;
            } 
            else if (this.c_data.conf.chapters[c].type == 'atlas') { //atlas
                this.currentChapter = c;
                this.type = 'atlas';
                this.maps = this.c_data.conf.chapters[c].maps;
                this.backgrounds = this.c_data.conf.chapters[c].atlas_background;
                this.bgColor = '#ffffff';
                if (this.c_data.conf.chapters[c].hasOwnProperty('bgcolor'))
                    this.bgColor = this.c_data.conf.chapters[c].bgcolor;

                this.currentMap = Object.keys(this.c_data.conf.chapters[c].maps)[0];
                this.layers = [];
                this.layers_raster = [];

                this.makeMapLibre(c).then(() => {
                    this.loadMapLibre(Object.keys(this.maps)[0]);
                })
            }
        },

        makeMapLibre:  function (c) {
            return new Promise(resolve => {
                this.$nextTick(() => {

                    const bgLayer = {
                        "id": "background",
                        "type": "background",
                        "paint": {
                            "background-color": this.bgColor,
                        }
                    }
                    let sources = {},
                        layers = [bgLayer];

                    // for now, if there is one vector tile background chosen, all rasters are ignored and no buttons to change backgrounds are available
                    let bgVector = false,
                        bgInsertBeforeLayer = false;

                    for (index in this.backgrounds) {
                        let bg = this.backgrounds[index];
                        if (bg.source.type === "raster") {
                            if (typeof(bg.source.tiles)!='object'){
                                bg.source.tiles=[bg.source.tiles]
                            }
                            sources[bg.name] = bg.source;
                            layers.push({
                                "id": bg.name,
                                "type": bg.source.type,
                                "source": bg.name,
                                "layout": {
                                    "visibility": "none"
                                },
                            });
                        }
                        else if (bg.source.type === "vector") {
                            bgVector = bg.source;
                        }
                    }

                    // raster backgrounds
                    let style = {
                        "version": 8,
                        "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
                        "sources": sources,
                        "layers": layers,
                        "sprite": this.sprites
                    }

                    if (bgVector) {
                        style = bgVector.style;
                        //bgInsertBeforeLayer = bgVector.insertBeforeLayer

                        // get first vector layer
                        fetch(style)
                        .then(res => res.json())
                        .then(r => {
                            bgInsertBeforeLayer = r.layers[0].id;
                        });
                    }

                    let el = document.getElementById('atlas-map');
                    el.innerHTML = '';
                    this.map = new maplibregl.Map({
                        container: 'atlas-map',
                        style: style,
                        antialias :true
                    });
                    this.map.isVector = bgVector !== false;
                    this.map.insertBeforeLayer = bgInsertBeforeLayer;

                    /********************* */
                    this.map.on('styleimagemissing', async (e) => {
                        const id = e.id; 
                        ll = await this.map.loadImage(this.sprites_url+id+'.png')
                        this.map.addImage(id,  ll.data, {pixelRatio: 2, sdf:true});
                    });

                    //*********************** */
                    this.map.dragRotate.disable();
                    this.map.touchZoomRotate.disableRotation();
                    let scale = new maplibregl.ScaleControl({
                        maxWidth: 250,
                        unit: 'metric'
                    });

                    this.map.addControl(scale);

                    class HomeButton {
                        onAdd(map) {
                            const div = document.createElement("div");
                            div.id = "info-coordinates";
                            div.addEventListener("contextmenu", (e) => e.preventDefault());
                            return div;
                        }
                    }

                    const homeButton = new HomeButton();
                    this.map.addControl(homeButton, "bottom-left");

                    this.map.on('style.load', () => {
                        resolve();

                        if (bgVector) {
                            this.map.addLayer(bgLayer, this.map.insertBeforeLayer);
                        }
                    });

                    // Add zoom and rotation controls to the map.
                    this.map.addControl(new maplibregl.NavigationControl());

                    // tooltip
                    const tooltip = new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false
                    });

                    // coordinates
                    this.map.on('mousemove', (e) => {
                        document.getElementById('info-coordinates').innerHTML =
                            'lat: ' + Number(e.lngLat.wrap().lat).toFixed(5) +
                            ' | lng: ' + Number(e.lngLat.wrap().lng).toFixed(5);

                        const features = this.map.queryRenderedFeatures(this.getPointBuffer(e.point));
                        if (features.length>0) {
                            let popupTxt = this.getPopupTxt(features[0]);

                            if (this.popup_on_click && popupTxt)
                                this.map.getCanvas().style.cursor = 'pointer';

                            if (this.popup_on_hover) {
                                if (popupTxt)
                                    tooltip.setLngLat(e.lngLat).setHTML(popupTxt).addTo(this.map);
                                else
                                    tooltip.remove();
                            }
                        }
                        else {
                            tooltip.remove();
                            if (this.popup_on_click)
                                this.map.getCanvas().style.cursor = '';
                        }
                    })

                    ////// measures
                    this.measures_control =  new maplibreGLMeasures.default(this.measure_options)
                    this.map.addControl(this.measures_control, 'top-left');

                    // backgrounds
                    if (!bgVector && this.backgrounds.length > 0) {
                        let allBGnames = [];
                        for (bg in this.backgrounds) {
                            allBGnames.push(this.backgrounds[bg].name);
                        }

                        this.map.addControl(new MenuControl({
                            "name": "No background"
                        }, allBGnames, true), 'top-left');
                        this.posMenu++;
                        for (bg in this.backgrounds) {
                            this.map.addControl(new MenuControl(this.backgrounds[bg], allBGnames, this.posMenu === 0), 'top-left');
                            this.posMenu++;
                        }
                    }

                    //popup
                    const popup = new maplibregl.Popup({
                        closeButton: true,
                        closeOnClick: true
                    });

                    this.map.on('click', (e) => {

                        let mapContainer = document.getElementById('atlas-map');
                        let measureActive = mapContainer.classList.contains('mode-draw_line_string') || mapContainer.classList.contains('mode-draw_polygon');

                        if (!measureActive) {

                            let features = this.map.queryRenderedFeatures(this.getPointBuffer(e.point));
                            //console.log(features.length, features)
                            features = features.filter((f) => f.layer.metadata.legend_status == true);
                            //console.log(features.length)

                            features = features.filter((f) => {
                                var desc = f.layer.id.split(':')[2];
                                var lab =  desc.slice((desc.indexOf(')') + 1))
                                if (lab == 'labeling'){
                                    return false
                                }else{
                                    return true
                                }
                            });
                            
                            if (features.length > 0) {
                                
                                for (f in features){
                                    //console.log(f, features.length, features[f].layer)
                                    if (features[f].layer.metadata 
                                        && features[f].layer.metadata.name 
                                        && features[f].layer.metadata.paint['fill-opacity'] != 0
                                        && features[f].layer.metadata.paint['fill-color'] != 'transparent'
                                            ) {

                                        let popupTxt = '';

                                        if (this.popup_on_click) {
                                            popupTxt = this.getPopupTxt(features[f]);
                                        }

                                        if (this.zoom_on_click){
                                            this.map.flyTo({
                                                center: e.lngLat,
                                                essential: true,
                                                //zoom: this.map.getMaxZoom() - this.xz
                                                zoom: features[0].layer.metadata.maxzoom-0.01
                                            });
        
                                            if (this.popup_on_click && popupTxt) {
                                                this.map.once('moveend',()=>{
                                                    popup.setLngLat(e.lngLat).setHTML(popupTxt).addTo(this.map);
                                                    this.map.once('zoom',()=>{
                                                        popup.remove();
                                                    }) 
                                                });
                                            }
                                        }
                                        else if (this.popup_on_click && popupTxt) {
                                            popup.setLngLat(e.lngLat).setHTML(popupTxt).addTo(this.map);
                                            this.map.once('zoom',()=>{
                                                popup.remove();
                                            })
                                        }
                                        
                                        break;
                                    }
                                }
                            }
                        }
                    });

                    this.map.on('zoom', () => {
                        this.currentZoom = this.map.getZoom();
                        //console.log(this.currentZoom)
                    });
                })
            })
        },


        getPopupTxt: function(feature) {

            let txt = false;

            if (feature.hasOwnProperty('layer') && feature.layer.hasOwnProperty('metadata') && feature.layer.metadata.hasOwnProperty('popup') && feature.layer.metadata.popup.hasOwnProperty('popup_status') && feature.layer.metadata.popup.popup_status) {
            //if (feature.hasOwnProperty('layer') && feature.layer.hasOwnProperty('metadata') && feature.layer.metadata.hasOwnProperty('popup') ) {
                let name = feature.layer.metadata.name
                let description = feature.layer.id.split(':')[2]

                labeling = description.slice((description.indexOf(')') + 1))
                txt = `<b>${name}</b>`;
                if (description != '' && labeling != 'labeling') {
                    txt += '<br>' + labeling
                }

                // other popup items
                if (feature.hasOwnProperty('layer') && feature.layer.hasOwnProperty('metadata') && feature.layer.metadata.hasOwnProperty('popup') && feature.layer.metadata.popup.hasOwnProperty('popup_status') && feature.layer.metadata.popup.popup_status) {
                    for (fi in feature.layer.metadata.popup.fields){
                        if (feature['properties'][feature.layer.metadata.popup.fields[fi].field] !=undefined){
                            txt+='<hr>'
                            txt += feature.layer.metadata.popup.fields[fi].name +' : '
                            txt += '<b>'
                            txt += feature['properties'][feature.layer.metadata.popup.fields[fi].field]
                            txt += '</b>'
                        }
                    }
                }
            }

            return txt;
        },


        getPointBuffer: function(point) {

            return [
                [point.x - this.mouse_buffer, point.y - this.mouse_buffer],
                [point.x + this.mouse_buffer, point.y + this.mouse_buffer]
            ];
        },


        loadMapLibre: function (m) {

            //allstyles = {};
            this.$nextTick(() => {

                // clean map
                this.atlas_legend = [];
                // this.removeMeasures();
                this.cleanMap();
                //this.layers = [];

                this.menuControls.forEach((control) => {
                    this.map.removeControl(control);
                });
                this.menuControls = [];
                this.posMenu = 0;

                //set current map
                this.currentMap = m;
                this.map.setMinZoom(this.maps[m].minzoom);
                this.map.setMaxZoom(this.maps[m].maxzoom + this.xz);

/*                this.map.setCenter(this.c_data.conf.chapters[this.currentChapter]['view.center']);
                this.map.setZoom(this.c_data.conf.chapters[this.currentChapter]['view.zoom']);
                this.map.setBearing(-this.c_data.conf.chapters[this.currentChapter]['view.rotation']);
*/
                /////////
                // bounds
                let min = JSON.parse(JSON.stringify( this.c_data.conf.chapters[this.currentChapter]['view.bbox'][0] ))
                let max = JSON.parse(JSON.stringify( this.c_data.conf.chapters[this.currentChapter]['view.bbox'][1] ))
                if(this.extrabounds){
                    vw = max[0]-min[0];
                    vh = max[1]-min[1];
                    min[0] = min[0]-vw*1;
                    max[0] = max[0]+vw*1;
                    min[1] = min[1]-vh*1;
                    max[1] = max[1]+vh*1;
                }

                //this.map.setMaxBounds(this.c_data.conf.chapters[this.currentChapter]['view.bbox']);
                this.map.setMaxBounds([min, max]);
                this.map.fitBounds(this.c_data.conf.chapters[this.currentChapter]['view.bbox'], {
                    bearing: -this.c_data.conf.chapters[this.currentChapter]['view.rotation'],
                    linear: false,
                    duration: 0,
                    //padding: {top: 150, bottom: 150, left: 150, right: 150}
                });
                this.currentZoom = this.map.getZoom();

                // get menu layer ids
                let menuLayerIds = [];
                for (let mm in this.maps[m].layers) {
                    let layer = this.maps[m]['layers'][mm];
                    if (layer.type == 'maplibre' && layer.layer_id !== undefined && layer.menu === 'radio') {
                        menuLayerIds.push(layer.layer_id);
                    }
                }

                //load layers
                for (let mm in this.maps[m].layers) {
                    let layer = this.maps[m]['layers'][mm];
                    //if (layer.type == 'maplibre') {
                        if (layer.layer_id !== undefined)
                            this.loadMapLibreLayer(m, mm, menuLayerIds);
                        else
                            console.log('!!!layer_id is undefined')
                    //}
                }

                this.atlas_legend.reverse();

                this.$forceUpdate();

                if (this.map.getLayer('OpenStreetMap')){
                    this.map.setLayoutProperty('OpenStreetMap', 'visibility', 'none');
                }

                if (this.map.getLayer('Satellite')){
                    this.map.setLayoutProperty('Satellite', 'visibility', 'none');
                }
                
                this.sortMeasureslayers()
            })

        },

        sortMeasureslayers: function(){

            let ml = [
                'gl-draw-line.cold','gl-draw-polygon-fill.cold','gl-draw-polygon-midpoint.cold', 'gl-draw-polygon-stroke-active.cold',
                'gl-draw-polygon-and-line-vertex-halo-active.cold', 'gl-draw-polygon-and-line-vertex-active.cold', 'gl-draw-line-static.cold', 
                'gl-draw-polygon-fill-static.cold', 'gl-draw-polygon-stroke-static.cold',  'gl-draw-line.hot', 'gl-draw-polygon-fill.hot', 
                'gl-draw-polygon-midpoint.hot', 'gl-draw-polygon-stroke-active.hot', 'gl-draw-polygon-and-line-vertex-halo-active.hot',
                'gl-draw-polygon-and-line-vertex-active.hot', 'gl-draw-line-static.hot',  'gl-draw-polygon-fill-static.hot',
                'gl-draw-polygon-stroke-static.hot', 'layer-draw-labels'
            ];

            let ll = this.map.getStyle().layers;
            if ( ml.indexOf( ll.slice(-1)[0].id )==-1){
                if (this.map.getLayer( 'gl-draw-line.cold')){
                    ll.forEach((l) => {
                        if (ml.indexOf(l.id)==-1){
                            this.map.moveLayer(l.id, 'gl-draw-line.cold' )
                        }
                    })
                }
            }
        },

        cleanMap: function () {
            // vector
            this.layers.forEach((layer) => {
                layer.maplibreLayers.forEach((capa) => {
                    if (this.map.getLayer(capa.id))
                        this.map.removeLayer(capa.id);
                });
                if (this.map.getSource(layer.layer_id))
                    this.map.removeSource(layer.layer_id);
            });

            // raster
            this.layers_raster.forEach((layer) => {
                if (this.map.getLayer(layer.layer_id))
                    this.map.removeLayer(layer.layer_id);
                // remove source
                if (this.map.getSource(layer.layer_id))
                    this.map.removeSource(layer.layer_id);
            });
        },

        loadMapLibreLayer: function (m, mm, menuLayerIds) {
            let layer = this.maps[m].layers[mm];

            // preprocess and add maplibre source
            if (layer.source !== null && layer.source !== undefined) {
                // add project path to geojson data source
                if (layer.source.type === 'geojson' && layer.source.data.indexOf(this.url_project) === -1) {
                    layer.source.data = this.url_project + layer.source.data;
                }
                // cache
                let cache = true;
                if (layer.cache !== null && layer.cache !== undefined) {
                    cache = layer.cache;

                    if (!cache) {
                        // add timestamp
                        if (layer.source.type === 'vector' && layer.source.tiles) {
                            layer.source.tiles.forEach((tile, i) => {
                                layer.source.tiles[i] += ts;// "?ts=" + new Date().valueOf();
                            });
                        } else if (layer.source.type === 'geojson' || layer.source.type === 'raster') {
                            layer.source.data += ts; //"?ts=" + new Date().valueOf();
                        }
                    }
                }

                // subdomain url template
                if (layer.source.type === 'vector' && layer.source.tiles) {
                    let newTileUrls = [];
                    layer.source.tiles.forEach((tile, i) => {
                        const regex = /({[0-9][-][0-9]})/,
                            regex1 = /({[0-9][-])/,
                            regex2 = /([-][0-9]})/;
                        if (regex.test(tile)) {
                            // substitute subdomain patterns {0-5}
                            const pos1 = tile.search(regex1),
                                pos2 = tile.search(regex2);
                            const num1 = parseInt(tile[pos1 + 1]),
                                num2 = parseInt(tile[pos2 + 1]);
                            for (let i = num1; i <= num2; i++) {
                                let newTileUrl = tile.replace(regex, i);
                                newTileUrls.push(newTileUrl);
                            }
                        } else {
                            // no subdomain pattern to substitute
                            newTileUrls.push(tile);
                        }
                    });
                    layer.source.tiles = newTileUrls;
                }

                //console.log('1. add source', layer, this.map.getLayer(layer.id), this.map.getSource(layer.layer_id));
                // remove vector layers
                if (layer.maplibreLayers !== null && layer.maplibreLayers !== undefined) {
                    layer.maplibreLayers.forEach((capa) => {
                        if (this.map.getLayer(capa.id))
                            this.map.removeLayer(capa.id);
                    });
                }
                // remove raster layer
                if (this.map.getLayer(layer.layer_id))
                    this.map.removeLayer(layer.layer_id);
                // remove source
                if (this.map.getSource(layer.layer_id))
                    this.map.removeSource(layer.layer_id);
                this.map.addSource(layer.layer_id, layer.source);
                this.layers_raster.push(layer);

                // preprocess and add maplibre style
                if (layer.maplibreLayers !== null && layer.maplibreLayers !== undefined) {
                    this.layers.push(layer);
                    let layerIds = [];

                    // layer style
                    if (layer.menu === 'radio' && this.posMenu === 0 || !layer.hasOwnProperty('menu')) {
                        //layer.maplibreLayers.reverse()
                        layer.maplibreLayers.forEach((l) => {
                            if (l.filter !== "ELSE") {
                                // console.log("add", l.id);
                                layerIds.push(l.id);

                                if (this.map.isVector)
                                    this.map.addLayer(l, this.map.insertBeforeLayer);
                                else
                                    this.map.addLayer(l);
                            }
                        })
                    }

                    // layer menu
                    if (layer.menu === 'radio') {
                        let menuControl = new MenuControl(layer, this.posMenu === 0, menuLayerIds);
                        this.map.addControl(menuControl, 'top-left');
                        this.menuControls.push(menuControl);
                        this.posMenu++;
                    }

                    // legend
                    if (layer.legend && layer.legend.legend_status==true) {

                        let div = '<div id="' + layer.id + '"';
                        if (this.layer_show_hide) {
                            div += 'style="cursor: pointer;"';
                        }

                        div += '><h6 class="layer-name">' + layer.name + '</h6>'+this.createSVGLegend(layer.maplibreLayers, layer.geometryType)+'</div>';
                        
                        if (layer.maxzoom >=  this.maps[m].maxzoom ){
                            this.atlas_legend.push({'html':div, 'legendId':layer.id, 'layerIds':layerIds.join(), 'minZoom':layer.minzoom, 'maxZoom':layer.maxzoom+this.xz})
                        }else if(layer.minzoom ==  this.maps[m].minzoom){
                            this.atlas_legend.push({'html':div, 'legendId':layer.id, 'layerIds':layerIds.join(), 'minZoom':layer.minzoom, 'maxZoom':layer.maxzoom})
                        }else{
                            this.atlas_legend.push({'html':div, 'legendId':layer.id, 'layerIds':layerIds.join(), 'minZoom':layer.minzoom, 'maxZoom':layer.maxzoom})
                        }
                    }
                }

                // add raster layer
                //console.log(layer.layer_id, layer.source.type);
                if (layer.source.type === 'raster') {
                    this.map.addLayer({
                        id: layer.layer_id,
                        source: layer.layer_id,
                        type: 'raster'
                    });

                    this.map.setLayoutProperty(layer.layer_id, 'visibility', 'visible');

                    // legend
                    if (layer.legend && layer.legend.legend_status==true) {

                        let div = '<div id="' + layer.id + '"';
                        if (this.layer_show_hide) {
                            div += 'style="cursor: pointer;"';
                        }

                        div += '><h6 class="layer-name">' + layer.name + '</h6>'+this.createSVGLegendRaster(layer)+'</div>';
                        
                        if (layer.maxzoom >=  this.maps[m].maxzoom ){
                            this.atlas_legend.push({'html':div, 'legendId':layer.id, 'layerIds':layer.layer_id, 'minZoom':layer.minzoom, 'maxZoom':layer.maxzoom+this.xz})
                        }else if(layer.minzoom ==  this.maps[m].minzoom){
                            this.atlas_legend.push({'html':div, 'legendId':layer.id, 'layerIds':layer.layer_id, 'minZoom':layer.minzoom, 'maxZoom':layer.maxzoom})
                        }else{
                            this.atlas_legend.push({'html':div, 'legendId':layer.id, 'layerIds':layer.layer_id, 'minZoom':layer.minzoom, 'maxZoom':layer.maxzoom})
                        }
                    }
                }
            }
        },


        toggleLayer: function(legendId, layerIds) {

            if (this.layer_show_hide) {
                layerIds.split(",").forEach((layerId) => {
                    const visibility = this.map.getLayoutProperty(
                        layerId, 'visibility'
                    );
                    //console.log(layerId, visibility);

                    if (visibility === 'visible') {
                        this.map.setLayoutProperty(layerId, 'visibility', 'none');
                        document.getElementById(legendId).className = 'invisible';
                    } else {
                        document.getElementById(legendId).className = '';
                        this.map.setLayoutProperty(
                            layerId,
                            'visibility',
                            'visible'
                        );
                    }
                });
            }
        },


        createSVGLegend: function (styles, geomType) {

            let legend = [];
            let legend_items = {};

            styles.forEach((style) => {

                //let iid = style.id.split(':').slice(0, 3).join(':');
                let iid = style.id.split(':').slice(0, -1).join(':'); //avoid : in ids

                if (legend_items[iid] == undefined) {
                    legend_items[iid] = {
                        'styles': [],
                        'paints':[],
                        'geom_type': []
                    }
                }
                //elimina el resto de los filtros
                if (style.filter != 'ELSE') {
                    legend_items[iid]['styles'].push(style)
                    geom_type = Object.keys(style.paint)[0].split('-')[0];
                    legend_items[iid]['geom_type'].push(style.type);
                    legend_items[iid]['paints'].push(geom_type);
                }else if(style.filter == 'ELSE'){
                    let stid = style.id.split(':')
                    if (stid.slice(-2)[0].split(')').slice(-1)[0] !=''){
                        legend_items[iid]['styles'].push(style)
                        geom_type = Object.keys(style.paint)[0].split('-')[0];
                        legend_items[iid]['geom_type'].push(style.type);
                        legend_items[iid]['paints'].push(geom_type);
                    }
                }


            });

            let symbol = '';
            for (k in legend_items) {
                let li = legend_items[k];
                if (geomType == 'Polygon' && li['geom_type'].length>0 && li['paints'].indexOf('text') == -1) {
                    var draw = SVG().size(50, 20);
                    li['styles'].forEach((s) => {
                        ss = s.metadata;
                        if (Object.keys(ss.paint)[0].split('-')[0] == 'fill') {
                            if (ss.paint['fill-color'] == undefined) {
                                ss.paint['fill-color'] = 'transparent';
                            }
                            rect = draw.rect(50, 20).fill(ss.paint['fill-color']);
                            if (ss.paint['fill-opacity'] != undefined) {
                                rect.attr({
                                    'fill-opacity': ss.paint['fill-opacity']
                                })
                            }
                        } else if (Object.keys(ss.paint)[0].split('-')[0] == 'line') {
                            let at = {};
                            if (ss.paint['line-width'] != undefined) {
                                at['width'] = ss.paint['line-width'] * 2;
                                if (at['width'] <2) {
                                    at['width']=2
                                }else if(at['width'] >10){
                                    at['width'] = 10
                                }                      
                            };
                            if (ss.paint['line-color'] != undefined) {
                                at['color'] = ss.paint['line-color']
                            };
                            if (ss.paint['line-opacity'] != undefined) {
                                at['opacity'] = ss.paint['line-opacity']
                            };
                            if (ss.paint['line-dasharray'] != undefined) {
                                at['dasharray'] = ss.paint['line-dasharray'].join(' ')
                            };
                            draw.rect(50, 20).fill('none').stroke(at);
                        }
                    })

                    symbol = draw.svg();
                    //label = li.styles[0].id.split(':')[2];
                    //label = label.slice(label.indexOf(')') + 1) //clean label parentesis
                    
                    label = li.styles[0].id.split(':').slice(-2,-1).join(':');
                    label = label.slice(label.indexOf(')') + 1) //clean label parentesis

                    let entry = '<div class="legend-row" gt="polygon"><div class="legend-symbol-left">' + symbol + '</div><div class="legend-symbol-right">' + label + '</div></div>'
                    legend.push(entry)
                } 
                else if (geomType == 'Line' && li['geom_type'].length>0 && li['geom_type'].indexOf('line') != -1 && li['paints'].indexOf('text') == -1) {  
                    
                    var draw = SVG().size(50, 20);
                    var gw = draw.group();
                    let h = 0;
                    // var sc = 0.5;
                    let maxwidth= 20; //befora was 5

                    //tomamos el max width
                    li['styles'].forEach((s) => {
                        ss = s.metadata;
                        if (Object.keys(ss.paint)[0].split('-')[0] == 'line') {
                            let at = {};
                            if (ss.paint['line-width'] != undefined) {
                                w = ss.paint['line-width'];
                            }
                            if (w > h) {h = w;}
                        }
                    });

                    let f= 0.5; // before was 1
                    if (h>maxwidth){f = maxwidth/h;}
                    li['styles'].forEach((s) => {
                        ss = s.metadata;
                        if (Object.keys(ss.paint)[0].split('-')[0] == 'line') {
                            let at = {};
                            if (ss.paint['line-width'] != undefined) {
                                at['width'] = ss.paint['line-width']*f ;
                            };

                            if (ss.paint['line-color'] != undefined) {
                                at['color'] = ss.paint['line-color'];
                            };

                            if (ss.paint['line-opacity'] != undefined) {
                                at['opacity'] = ss.paint['line-opacity'];
                            };

                            if (ss.paint['line-dasharray'] != undefined) {
                                at['dasharray'] = ss.paint['line-dasharray'].join(' ')
                            };

                            gw.line(0, 0, 50, 0).stroke(at);
                        }
                    })

                    h = Math.min(h, 20);
                    // draw.size(50, h)
                    draw.size(50, 20);
                    // gw.move(0, h/2)
                    // console.log(h)
                    gw.move(0, 10);

                    symbol = draw.svg();
                    label = li.styles[0].id.split(':')[2];
                    label = label.slice(label.indexOf(')') + 1); //clean label parentesis
                    let entry = '<div class="legend-row"  gt="line"><div class="legend-symbol-left">' + symbol + '</div><div class="legend-symbol-right">' + label + '</div></div>'
                    legend.push(entry);

                }
                //else if (li['geom_type'].indexOf('circle') != -1) {
                else if (geomType == 'Point' && li['geom_type'].length>0 && li['paints'].indexOf('text') == -1 && li['paints'].indexOf('circle') >= 0) {
                    var draw = SVG().size(20, 20);
                    var gw = draw.group();
                    li['styles'].forEach((s) => {
                        ss = s.metadata;
                        if (Object.keys(ss.paint)[0].split('-')[0] == 'circle') {

                            let at = {};
                            if (ss.paint['circle-stroke-width'] != undefined) {
                                at['width'] = ss.paint['circle-stroke-width']
                            };

                            if (ss.paint['circle-stroke-color'] != undefined) {
                                at['color'] = ss.paint['circle-stroke-color']
                            };

                            var ra=16;
                            if (ss.paint['circle-radius'].length==3){
                                let val = ss.paint['circle-radius'][1];
                                if (Array.isArray(val))
                                    val = 10;
                                ra = eval(val+ss.paint['circle-radius'][0]+ss.paint['circle-radius'][2])*2;
                                ra =Math.min(ra, 16)
                            }

                            ci = gw.circle(ra);
                            ci.fill( ss.paint['circle-color']);
                            ci.stroke({ color: at['color'], width: at['width']/2 });
                            ci.move(-ra/2, -ra/2);//center multiple points
                        }
                    })

                    gw.move( (20-gw.bbox().w)/2, (20-gw.bbox().h)/2 );

                    symbol = draw.svg();
                    label = li.styles[0].id.split(':')[2];
                    label = label.slice(label.indexOf(')') + 1); //clean label parentesis
                    let entry = '<div class="legend-row"  gt="point"><div class="legend-symbol-left">' + symbol + '</div><div class="legend-symbol-right">' + label + '</div></div>'
                    legend.push(entry);
                }
                else if (geomType == 'Point' && li['geom_type'].length>0 && li['paints'].indexOf('icon') >= 0) {
                    li['styles'].forEach((s) => {
                        ss = s.metadata;
                        var icon = this.sprites_url+ss.layout['icon-image']+'.png';
                        let entry = '<div class="legend-row"  gt="point"><div class="legend-symbol-left"><img class="icon" src="'+icon+'"></div><div class="legend-symbol-right">' + label + '</div></div>'
                        legend.push(entry);
                    })
                }
            }
            legend.reverse()
            return legend.join('')
        },

        createSVGLegendRaster(layer) {
            if (Object.hasOwn(layer, "legendstyle") && layer.legendstyle.length > 0) {
                let colorRamp = "";
                layer.legendstyle.forEach((style, i) => {
                    colorRamp += `<stop offset="${i*100/(layer.legendstyle.length-1)}%" stop-color="${style.color}" stop-opacity="${style.opacity}"/>`
                });

                let entry = `<div class="legend-row legend-raster"></div>
                <svg width="200" height="50">
                    <defs>
                        <linearGradient id="legend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            ${colorRamp}
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="200" height="30" fill="url(#legend-gradient)" />
                    <text x="0" y="45" font-size="12">${layer.legendstyle[0].label}</text>
                    <text x="150" y="45" font-size="12">${layer.legendstyle[layer.legendstyle.length-1].label}</text>
                </svg>
                `;
                return entry;
            }
            return "";
        }
    },


    mounted() {
        this.prepareData();

        maplibregl.addProtocol('cog', MaplibreCOGProtocol.cogProtocol);

        // detect end of transition to redraw map
        let drawer = document.getElementById('drawer');
        drawer.addEventListener('transitionend', () => {
            this.resize();
        });

        window.onresize = () => this.resize();
    },

    watch: {
        atlas_menu: function () {
            setTimeout(() => {
                this.resize()
            }, 2000);
        },

        ready: function () {
            if (this.ready == true) {
                document.title = this.c_data.conf.project.name;
            }
        },
    },

    computed: {},

    created() {
        window.addEventListener('resize', this.resize);
        this.resize();
    },

    destroyed() {
        window.removeEventListener('resize', this.resize);
    },

    components: {
    },
})


class MenuControl {
    constructor(basemap, allBGnames, first) {
        this.basemap = basemap;
        this.first = first;
        this.allBGnames = allBGnames;
    }

    onAdd(map) {
        this.map = map;
        this.container = document.createElement('button');
        this.container.className = 'maplibregl-ctrl menu-control layer-radio';
        if (this.first) {
            this.container.className += ' active'
        };
        this.container.textContent = this.basemap.name;

        this.container.addEventListener('click', (event) => {

            let layerName = event.target.innerHTML;
            
            if (!event.target.classList.contains("active")) {

                if (layerName !== "No background")
                    map.setLayoutProperty(layerName, 'visibility', 'visible');
                for (bg in this.allBGnames) {
                    if (this.allBGnames[bg] !== layerName && this.allBGnames[bg] !== "No background") {
                        map.setLayoutProperty(this.allBGnames[bg], 'visibility', 'none');
                    }
                }

                let mm = document.querySelector('.maplibregl-ctrl.menu-control.layer-radio.active');
                mm.classList.remove("active");
                event.target.className +=' active'
            }
            else {
                
            }
        });

        return this.container;
    }

    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}

