/**
 * Created by sumedas on 31-Mar-15.
 */
angular
    .module('meow.blog.edit',['ui.router', 'blogEditTemplates', 'ngSanitize', 'ui.select', 'hc.marked', 'toggle-switch'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('blog', {
                abstract: true,
                views: {
                    blogEdit: {
                        controller: 'BlogEditCtrl',
                        templateUrl: 'blog-edit.base.tpl.html'
                    }
                }
            })
            .state('blog.list', {
                url: '/blogs',
                views: {
                    main: {
                        controller: 'BlogEditListCtrl',
                        templateUrl: 'blog-edit.list.tpl.html'
                    }
                }
            })
            .state('blog.list.tag', {
                url: '/tag/:tag',
                views: {
                    main: {
                        controller: 'BlogEditListCtrl',
                        templateUrl: 'blog-edit.list.tpl.html'
                    }
                }
            })
            .state('blog.edit', {
                url: '/blogs/:year/:month/:date/:slug',
                views: {
                    main: {
                        controller: 'BlogEditPostCtrl',
                        templateUrl: 'blog-edit.post.tpl.html'
                    },
                    side: {
                        controller: 'BlogEditPostSideCtrl',
                        templateUrl: 'blog-edit.post.side.tpl.html'
                    }
                }
            });
    }]);