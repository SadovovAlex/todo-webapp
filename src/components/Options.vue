<template>
    <div class="todo-info-page">

        <div>
            <h4>Авторизация</h4>
            <div v-if="user.provider">
                <div class="user-wrap">
                    <div class="user-photo" :style="'background-image: url('+ user.photo +')'"></div>
                    <div class="user-info">
                        <span>Привет, {{ user.name }}</span><span v-if="user.email"> ({{ user.email }})</span>.
                    </div>
                </div>
                <p>
                    Ты авторизован <span class="text-primary">{{ user.provider }}</span>
                    Твои списки буду синхронизированы при наличии интернета и доступны на других твоих устройствах.
                </p>
                <p>
                    <button class="btn bg-secondary-hover icon-logout icon-pr shadow-paper" @click="emit( 'userLogoff' )">Выйти</button>
                </p>
            </div>
            <div v-else>
                <p>
                    Данные остануться доступны только на этом устройстве, для того чтобы просматривать их везде, авторизуйтесь:
                </p>
                <p>
                    <button class="btn bg-secondary-hover icon-google icon-pr shadow-paper" @click="emit( 'userLogin', 'google' )">Google</button>
                    <button class="btn bg-secondary-hover icon-twitter icon-pr shadow-paper" @click="emit( 'userLogin', 'twitter' )">Twitter</button>
                    <button class="btn bg-secondary-hover icon-github icon-pr shadow-paper" @click="emit( 'userLogin', 'github' )">Github</button>
                </p>
            </div>
        </div>

        <hr />

        <div>
            <h4>Данные</h4>
            <p>
                Выгрузка и загрузка задач в <b>JSON формате</b>.
                Вы можете выгрузить задачи для <b>надежного сохранения</b> или использовать для загрузки на устройства не имеющие синхронизации.
            </p>
            <p>
                <button class="btn bg-secondary-hover icon-download icon-pr shadow-paper" @click="exportData()">Выгрузить</button>
                <button class="btn bg-secondary-hover icon-save icon-pr shadow-paper" @click="importData()">Загрузить</button>
                <button v-if="hasData()" class="btn bg-danger-hover icon-trash icon-pr shadow-paper" @click="flushData()">Очистить</button>
            </p>
        </div>

        <hr />

        <div>
            <h4>Опции</h4>

            <div class="form-wrap">

                <div class="form-row">
                    <div class="form-title">Располагать новую задачу:</div>
                    <div class="form-controls">
                        <label class="form-toggle">
                            <input type="radio" name="taskInsertPosition" value="top" :checked="options.taskInsertPosition == 'top'" @change="onChange( $event )" />
                            <span>Сверху</span>
                        </label>
                        <label class="form-toggle">
                            <input type="radio" name="taskInsertPosition" value="bottom" :checked="options.taskInsertPosition == 'bottom'" @change="onChange( $event )" />
                            <span>Снизу</span>
                        </label>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-title">Располагать новый список:</div>
                    <div class="form-controls">
                        <label class="form-toggle">
                            <input type="radio" name="listInsertPosition" value="top" :checked="options.listInsertPosition == 'top'" @change="onChange( $event )" />
                            <span>Сверху</span>
                        </label>
                        <label class="form-toggle">
                            <input type="radio" name="listInsertPosition" value="bottom" :checked="options.listInsertPosition == 'bottom'" @change="onChange( $event )" />
                            <span>Снизу</span>
                        </label>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-title">Автовыбор нового списка:</div>
                    <div class="form-controls">
                        <label class="form-toggle">
                            <input type="checkbox" name="listAutoSelect" :checked="options.listAutoSelect" @change="onChange( $event )" />
                            <span>Включить</span>
                        </label>
                    </div>
                </div>

            </div>

        </div>

    </div>
</template>


<script>
// dependencies
import Prompt from "../scripts/Prompt";
import Utils from "../scripts/Utils";

// component
export default {

    // component props
    props: {
        user: { type: Object, default: {}, required: false },
        options: { type: Object, default: {}, required: false },
        lists: { type: Array, default: [], required: false },
    },

    // app methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // check if lists has data
        hasData: function()
        {
            return this.lists.length || 0;
        },

        // on option toggle change
        onChange: function( e )
        {
            var key = e.target.name;
            var val = e.target.value;
            var opt = {};

            if( e.target.type === "checkbox" ) {
                val = e.target.checked;
            }
            opt[ key ] = val;
            this.emit( "saveOptions", opt, "Options have been saved." );
        },

        // import data button event
        importData: function()
        {
            if( !window.File || !window.FileList || !window.FileReader )
            {
                return this.emit( "showNotice", "error", "This browser does not support handling of files." );
            }
            var self  = this;
            var input = document.createElement( "input" );

            input.setAttribute( "type", "file" );
            input.setAttribute( "accept", ".json" );
            input.addEventListener( "change", function( e )
            {
                if( this.files && this.files.length )
                {
                    if( !/\.json$/i.test( this.files[0].name ) )
                    {
                        return self.emit( "showNotice", "warning", "Please select a JSON file." );
                    }
                    if( !this.files[0].size )
                    {
                        return self.emit( "showNotice", "warning", "The file you selected is empty." );
                    }
                    var reader = new FileReader();
                    reader.addEventListener( "load", function( e )
                    {
                        var data = JSON.parse( e.target.result || "{}" ) || {};
                        self.emit( "importOptions", data.options || {}, true );
                        self.emit( "importLists", data.lists || [], true );
                    });
                    reader.readAsText( this.files[0], "utf-8" );
                }
            });
            document.body.appendChild( input );
            setTimeout( function() { input.click(); }, 100 );
            setTimeout( function() { document.body.removeChild( input ); }, 200 );
        },

        // export data button event
        exportData: function()
        {
            var data = {
                timestamp: Date.now(),
                date: Utils.dateString(),
                address: location.href || "",
                options: this.options,
                lists: this.lists,
            };
            try {
                var link  = document.createElement( "a" );
                var frame = document.createElement( "iframe" );
                var json  = JSON.stringify( data );
                var name  = ( this.user.provider !== undefined ) ? this.user.provider : "local";
                var type  = "application/json;charset=utf-8";
                var file  = "todos."+ name +".data.json";
                var href  = "data:" + type + "," + encodeURIComponent( json );

                if( navigator.msSaveBlob ) // IE
                {
                    navigator.msSaveBlob( new Blob( [json], {type: type} ), file );
                }
                else if( "download" in link ) // HTML5
                {
                    link.setAttribute( "href", href );
                    link.setAttribute( "download", file );
                    document.body.appendChild( link );
                    setTimeout( function() { link.click(); document.body.removeChild( link ); }, 100 );
                }
                else { // all else
                    frame.setAttribute( "src", href );
                    document.body.appendChild( frame );
                    setTimeout( function() { document.body.removeChild( frame ); }, 300 );
                }
            }
            catch( e ) {
                this.emit( "showNotice", "error", e.message );
            }
        },

        // flush all data
        flushData: function()
        {
            var _flush = function()
            {
                this.emit( "saveDefaults" );
            };
            new Prompt({
                title: "Confirm...",
                confirm: "Delete all data saved by this app?",
                onAccept: _flush.bind( this ),
            });
        },

    },

};
</script>