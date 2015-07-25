/**
 * Created by sumedas on 31-Mar-15.
 */
angular
    .module('meow.blog.edit',['ngRoute', 'blogEditTemplates', 'ngSanitize', 'hc.marked', 'ngMorph'])
    .config(['$routeProvider', function ($routeProvider) {

        var metaArray =['$http', '$rootScope', function ($http, $rootScope) {

            if (!$rootScope.meta && !($rootScope.meta instanceof Object))
            {
                return $http({method: 'GET', url: '/api/meta'})
                    .then(function (pData) {
                        pData = pData.data || {};

                        $rootScope.meta = {
                            blogsPerPage: pData.blogsPerPage || 5,
                            username: pData.username || 'John Doe',
                            tags: pData.tags || [],
                            disqus: pData.disqus || {},
                            angularSocialShare: pData.angularSocialShare || {}
                        };
                        return $rootScope.meta;
                    });
            }
            else {
                return $rootScope.meta;
            }
        }];

        $routeProvider
            .when('/blogs/edit', {
                controller: 'BlogEditCtrl',
                templateUrl: 'blog-edit.list.tpl.html',
                resolve: {
                    meta: metaArray
                }
            })
            .when('/blogs/edit/tag/:tag', {
                controller: 'BlogEditCtrl',
                templateUrl: 'blog-edit.list.tpl.html',
                resolve: {
                    meta: metaArray
                }
            })
            .when('/blogs/edit/query/:query', {
                controller: 'BlogEditCtrl',
                templateUrl: 'blog-edit.list.tpl.html',
                resolve: {
                    meta: metaArray
                }
            });
        //$urlRouterProvider.otherwise('/blogs');
        /**
         * TODO: 1. Implement upload functionality [upload images in upload directory]
         * TODO: 4. Touch design aspects of font-awesome icons and textarea
         */
    }])
    .run(['$http', '$rootScope', '$routeParams', '$blogEdit', function ($http, $rootScope, $routeParams, $blogEdit) {

        function loadBlogs (pBlogsPerPage) {
            /**
             * Load blogs on state change
             * This controller is used by two states and is required to load
             * blogs based on whether the URL is /blogs/tag/:tag or not.
             */
            $rootScope.$on('$routeChangeSuccess', function loadBlogs () {

                if (!! $routeParams.tag)
                {
                    $blogEdit.getBlogsByTag($routeParams.tag, function (pData) {
                        $rootScope.blogs = pData;
                    }, pBlogsPerPage);
                }
                else if (!! $routeParams.query)
                {
                    $blogEdit.getBlogsByQuery($routeParams.query, function (pData) {
                        $rootScope.blogs = pData;
                    }, pBlogsPerPage)
                }
                else
                {
                    $blogEdit.getBlogs(function (pData) {
                        $rootScope.blogs = pData;
                    }, pBlogsPerPage);
                }
            });
        }

        if (!$rootScope.meta || !($rootScope.meta instanceof Object))
        {
            $http
                .get('/api/meta')
                .then(function (pData) {
                    pData = pData.data || {};
                    return pData.blogsPerPage;
                })
                .then(function (pBlogsPerPage) {
                    loadBlogs(pBlogsPerPage)
                });
        }
        else {
            loadBlogs($rootScope.meta.blogsPerPage);
        }
    }]);