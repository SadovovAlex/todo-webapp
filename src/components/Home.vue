
<template>
    <div class="todo-info-page">

        <h3>Привет</h3>
        <p>
            Это приложение для создания списков дел.
        </p>
        <p>
            Создай новый список
            <a class="icon-plus icon-pr" href="#" @click.prevent="emit( 'todosCreate' )">Новый список</a>,
            или выбери существующий в правой части экрана
            <a class="icon-book icon-pr" href="#" @click.prevent="emit( 'showSidebar' )">Sidebar Panel</a>
        </p>
        
        <!-- <p>
            You can find more information about how to use this application along with
            other technical and author details by looking at the
            <a class="icon-code icon-pr" href="#/about">About this app</a> page.
        </p> -->
        <p>
            Для того чтобы списки синхронизировались, можно авторизоваться в настройках
            <a class="icon-user icon-pr" href="#/options">Account &amp; options</a> и твои списки будут доступны с любого устройства
        </p>

        <hr />
       

    </div>
</template>

<script>
// component
export default {

    // component props
    props: {
        options: { type: Object, default: {}, required: false },
        user: { type: Object, default: {}, required: false },
    },

    // component methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // launch share window
        share: function( service )
        {
            var url    = window.location.href || "";
            var title  = "Todos web application";
            var status = "Todos web application by @raintek_ #webdev #javascript #vuejs | " + url;

            switch( service )
            {
                case "twitter":
                    return window.open( "//twitter.com/home?status="+ encodeURIComponent( status ), "_blank" );

                case "facebook":
                    return window.open( "//facebook.com/sharer/sharer.php?u="+ encodeURIComponent( url ) + "&t=" + encodeURIComponent( title ), "_blank" );

                case "reddit":
                    return window.open( "//reddit.com/submit?url="+ encodeURIComponent( url ) + "&title=" + encodeURIComponent( title ), "_blank" );
            }
        },

    }
};
</script>
