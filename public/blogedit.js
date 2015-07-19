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
            .when('/blogs', {
                controller: 'BlogEditCtrl',
                templateUrl: 'blog-edit.list.tpl.html',
                resolve: {
                    meta: metaArray
                }
            })
            .when('/blogs/tag/:tag', {
                controller: 'BlogEditCtrl',
                templateUrl: 'blog-edit.list.tpl.html',
                resolve: {
                    meta: metaArray
                }
            })
            .when('/blogs/query/:query', {
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
/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .service('$blogEdit', ['$http', function ($http) {
        var currentPageNo = 1, pageCount = 1, pageBlogList = [];

        var tags = [], months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                                 'August', 'September', 'October', 'November', 'December'];

        function computePageCount (pBlogsPerPage) {

            if (!pBlogsPerPage) {
                pBlogsPerPage = 1;
            }
            else if (typeof pBlogsPerPage === 'string') {
                try {
                    pBlogsPerPage = parseInt(pBlogsPerPage);
                } catch (pErr) {
                    pBlogsPerPage = 1;
                }
            }
            else if (typeof pBlogsPerPage !== 'number')
            {
                pBlogsPerPage = 1;
            }

            var len = pageBlogList.length;
            return !!len ? parseInt (len / pBlogsPerPage) + (len % pBlogsPerPage === 0 ? 0 : 1) : 1;
        }

        function getBlogsByTag (pTag, pCallBack, pBlogsPerPage) {
            $http
                .get('/api/blogs/tags/' + pTag)
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount(pBlogsPerPage);
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, pBlogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlogsByQuery (pQuery, pCallBack, pBlogsPerPage) {
            $http
                .get('/api/blogs/query/' + pQuery)
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount(pBlogsPerPage);
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, pBlogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlogs (pCallBack, pBlogsPerPage) {
            $http
                .get('/api/blogs')
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount(pBlogsPerPage);
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, pBlogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlog (pBlog, pCallBack) {
            $http
                .get('/api/blogs/posts/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug)
                .success(function (pData) {
                    pCallBack(pData);
                })
                .error(console.error);
        }

        function getPrevBlogs (pCallBack, pBlogsPerPage) {
            if (currentPageNo > 1) {
                currentPageNo = currentPageNo - 1;
                pCallBack (pageBlogList.slice( (currentPageNo - 1) * pBlogsPerPage, currentPageNo * pBlogsPerPage));
            }
        }

        function getNextBlogs (pCallBack, pBlogsPerPage) {
            if (currentPageNo < pageCount) {
                currentPageNo = currentPageNo + 1;
                pCallBack (pageBlogList.slice( (currentPageNo - 1) * pBlogsPerPage, currentPageNo * pBlogsPerPage));
            }
        }

        function parseFileName (pFileName) {
            if (typeof pFileName !== 'string') {
                throw new Error ('pFileName is not a string');
            }

            var arr   = pFileName.split('-'),
                year  = arr.shift(),
                month = arr.shift(),
                date  = arr.shift(),
                slug  = arr.join('-');

            return {
                year: year,
                month: month,
                date: date,
                slug: slug,
                formattedDate: months[month - 1] + ' ' + parseInt(date) + ', ' + year
            }
        }

        function getTags (pCallBack) {
            if (tags.length === 0) {
                $http
                    .get('/tags')
                    .success(function (data) {
                        if (!data || ! data instanceof Array) {
                            data = ['meow','bow'];
                        }
                        tags = data;
                        pCallBack(data);
                    })
                    .error(console.error);
            }
            else {
                pCallBack(tags);
            }
        }

        function saveBlog (pBlog, pFn) {
            var isNewBlog = !pBlog.slug || !pBlog.year || !pBlog.month || !pBlog.date;

            if (isNewBlog) {
                $http
                    .post('/api/blogs', pBlog)
                    .success(function (pData) {
                        pFn('success', pData);
                    })
                    .error(function (pData) {
                        pFn('error', pData);
                    });
            }
            else {
                $http
                    .put('/api/blogs/posts/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug, pBlog.post)
                    .success(function (pData) {
                        pFn('success', pData);
                    })
                    .error(function (pData) {
                        pFn('error', pData);
                    });
            }
        }

        function deleteBlog (pBlog, pFn) {
            $http
                .delete('/api/blogs/posts/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug)
                .success(function (pData) {
                    pFn('success', pData);
                })
                .error(function (pData) {
                    pFn('error', pData);
                });
        }

        function previewBlog (pBlog, pCallBack) {

            pBlog = pBlog || {post: ''};

            pBlog.post = pBlog.post || '';

            var blog = {}, post = pBlog.post.split('\n'), postLen = post.length, i = 1, metaData = [];
            if (post[0].trim() !== '<!--') {
                throw new Error ('Incorrect format, missing "<!--"');
            }
            while (i < postLen) {
                var line = post[i].trim();
                if (line === '-->' ) {
                    break;
                }
                if (line === '') {
                    i = i + 1;
                    continue;
                }
                metaData.push(line);
                i = i + 1;
            }
            if (i === postLen) {
                throw new Error('Incorrect format, missing "-->"');
            }

            metaData = jsyaml.load(metaData.join('\n')) || {};

            var publishedDate = metaData['published-date'];
            publishedDate = months[publishedDate.getMonth()] + ' ' + publishedDate.getDate() +
                                   ', ' + publishedDate.getFullYear();
            blog.title = metaData.title;
            blog.subtitle = metaData.subtitle;
            blog['published-date'] = publishedDate;
            blog.post = pBlog.post;
            blog.tags = [];

            metaData.tags = metaData.tags || '';

            var tagsArray = metaData.tags.split(',');

            for (var j in tagsArray) {
                blog.tags.push(tagsArray[j].trim());
            }

            pCallBack(blog);
        }

        return {
            getCurrentPageNo: function () { return currentPageNo; },
            getPageCount: function () { return pageCount; },
            getBlogsByTag: getBlogsByTag,
            getBlogsByQuery: getBlogsByQuery,
            getBlogs: getBlogs,
            getBlog: getBlog,
            getPrevBlogs: getPrevBlogs,
            getNextBlogs: getNextBlogs,
            parseFileName: parseFileName,
            getTags: getTags,
            saveBlog: saveBlog,
            deleteBlog: deleteBlog,
            previewBlog: previewBlog
        };
    }]);
/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .directive('post',['$compile', 'marked', function ($compile, marked){
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, iElem, iAttrs) {
                scope.$watch(iAttrs.post, function(markDown) {
                    if (markDown && typeof markDown === 'string' && markDown.length !== 0) {
                        iElem.html(marked(markDown));
                        $compile(iElem.contents())(scope);//
                    }
                });
            }
        }
    }])
    .directive('youtube', ['$sce', function ($sce) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" allowfullscreen src="{{url}}"/></div>',
            link: function (scope, iElem, iAttrs) {
                scope.url = $sce.trustAsResourceUrl(iAttrs.url);
            }
        }
    }]);
/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .controller('BlogEditCtrl', ['$scope', '$blogEdit', '$location', 'meta', '$timeout', function ($scope, $blogEdit, $location, meta, $timeout) {

        $scope.blogToEdit = {};

        $scope.blogToDelete = {};

        $scope.previewBlog = {};

        $scope.verify = {
            deleteInput: '',
            deleteDone: false,
            blogSaved: false,
            incorrectDeleteInput: false
        };

        $scope.error = {
            blogSaved: false,
            blogDeleted: false
        };

        $scope.message = {
            blogSaved: 'The blog has been saved.',
            blogDeleted: 'The blog has been deleted.'
        };

        $scope.username = meta.username;

        // load next set of blogs
        $scope.next = function () {
            $blogEdit.getNextBlogs(function (data) {
                $scope.blogs = data;
            }, meta.blogsPerPage)
        };

        // load previous set of blogs
        $scope.prev = function () {
            $blogEdit.getPrevBlogs(function (data) {
                $scope.blogs = data;
            }, meta.blogsPerPage);
        };

        // determine if the current page is the first page of the result list
        $scope.isFirstPage = function () {
            return $blogEdit.getCurrentPageNo() === 1;
        };

        // determine if the current page is the last page of the result list
        $scope.isLastPage = function () {
            return $blogEdit.getCurrentPageNo() === $blogEdit.getPageCount();
        };

        $scope.getFormattedDate = function (pBlog) {
            return $blogEdit.parseFileName(pBlog.fileName).formattedDate;
        };

        $scope.loadBlog = function (pBlog) {
            var blogParams = $blogEdit.parseFileName(pBlog.fileName);
            // loads blog
            $blogEdit.getBlog({
                year: blogParams.year,
                month: blogParams.month,
                date: blogParams.date,
                slug: blogParams.slug
            }, function (pData) {
                $scope.blogToEdit = pData;

                $scope.getPreviewBlog(pData);
                // tempBlog = angular.copy(pData);
            });
        };

        $scope.deleteBlog = function (pBlog) {

            // console.log(pBlog.title, $scope.verify.deleteInput);
            if ($scope.verify.deleteInput !== pBlog.title)
            {
                $scope.verify.deleteDone = false;
                $scope.verify.incorrectDeleteInput = true;
                return;
            }

            pBlog = $blogEdit.parseFileName(pBlog.fileName);

            $blogEdit.deleteBlog(pBlog,
                function (pStatus, pData) {
                    if ('success' === pStatus)
                    {
                        $scope.verify.deleteDone = true;
                    }
                    else if ('error' === pStatus)
                    {
                        $scope.verify.deleteDone = false;
                        $scope.error.deleteDone = true;
                        $scope.message.blogDeleted = 'Error ' + (pData ? pData : '');
                    }
                }
            );
        };

        $scope.saveBlog = function (pBlog) {

            console.log(pBlog);

            var dateObject = $blogEdit.parseFileName(pBlog.fileName);

            $blogEdit.saveBlog({
                post: pBlog.post,
                year: dateObject.year,
                month: dateObject.month,
                date: dateObject.date,
                slug: pBlog.slug
            }, function (pStatus, pData) {
                if ('success' == pStatus)
                {
                    $scope.verify.blogSaved = true;
                }
                else if ('error' == pStatus)
                {
                    $scope.verify.blogSaved = false;
                    $scope.error.blogSaved = true;
                    $scope.message.blogSaved = 'Error ' + (pData ? pData : '');
                }
            });
        };

        $scope.getPreviewBlog = function (pBlog) {
            $scope.verify.blogSaved = false;
            pBlog.title = pBlog.title || '';
            pBlog.slug = pBlog.slug || pBlog.title.toLocaleLowerCase().replace(/[\W]/g, '-').replace(/[\-]{2,}/g, '-');
            $blogEdit.previewBlog(pBlog, function (pPreviewBlog) {
                $scope.previewBlog = pPreviewBlog;
            });
        };

        $scope.blogEditSettings = {
            closeEl: '.close',
            overlay: {
                templateUrl: 'blog-edit.post.tpl.html'
            }
        };

        $scope.deleteBlogSettings = {
            closeEl: '.close',
            modal: {
                templateUrl: 'blog-edit.delete.tpl.html'
            }
        };

        $scope.search = function () {
            $location.url('/blogs/query/' + $scope.query);
        };

        $scope.purgeEditScopeVar = function () {
            $timeout(function () {
                $scope.blogToEdit = {};
                $scope.previewBlog = {};
                $scope.verify.blogSaved = false;
                $scope.error.blogSaved = false;
                $scope.message.blogSaved = 'The blog has been saved';
            }, 2000);
        };

        $scope.purgeDeleteScopeVar = function () {
            $timeout(function () {
                $scope.blogToDelete = {};
                $scope.verify.deleteDone = false;
                $scope.error.deleteDone = false;
                $scope.verify.deleteInput = '';
                $scope.verify.incorrectDeleteInput = false;
                $scope.message.blogDeleted = 'The blog has been deleted';
            }, 2000);
        };

        $scope.loadBlogToDelete = function(pBlog) {
            $scope.blogToDelete = pBlog;
        };

        $scope.addBlog = function () {

            $scope.blogToEdit = {};

            var date = new Date(); //publishedDate.getMonth()

            $scope.blogToEdit.date = date.getDate();
            $scope.blogToEdit.month = date.getMonth();
            $scope.blogToEdit.year = date.getYear();
            $scope.blogToEdit.slug = 'new-post';

            var publishedDate = [date.getFullYear(), date.getMonth(), date.getDate()].join('-');

            var array = ['<!--', 'published-date: ' + publishedDate, 'title: New Post', 'subtitle: ', 'tags: ', 'keywords: ',
                        '-->', 'Write your post here...'];

            $scope.blogToEdit.post = array.join('\n');

            $scope.getPreviewBlog($scope.blogToEdit);
        }
    }]);
angular.module("blogEditTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("blog-edit.delete.tpl.html","<div class=\"container deleteModal\">\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-lg-10 col-md-10 col-sm-10 col-xs-12\">\r\n\r\n        </div>\r\n        <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-4 pull-right\">\r\n            <span class=\"glyphicon glyphicon-remove close\" ng-click=\"purgeDeleteScopeVar()\" style=\"font-size: 1.3em; margin-top: 20px;\"></span>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\" ng-if=\"!verify.deleteDone\">\r\n        <div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12\">\r\n            <p class=\"text-info\" style=\"margin-top: 10px;\">\r\n                This will permanently delete this blog post. Please enter the name of the blog below to delete it.\r\n            </p>\r\n\r\n            <p class=\"text-danger lead\">{{blogToDelete.title}}</p>\r\n\r\n            <input type=\"text\" ng-model=\"verify.deleteInput\"\r\n                   ng-style=\"verify.incorrectDeleteInput ? {width: \'100%\', color: \'red\', border: \'1px red solid\'} : {width: \'100%\', color: \'black\'}\"\r\n                   ng-change=\"verify.incorrectDeleteInput = false;\" style=\"width: 100%; color: black;\"/>\r\n\r\n            <button class=\"btn btn-danger\" ng-click=\"deleteBlog(blogToDelete)\" style=\"width: 100%; margin-top: 15px;\">Delete this blog</button>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\" ng-if=\"verify.deleteDone || error.deleteDone\">\r\n        <div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center\">\r\n            <h4 ng-class=\"verify.deleteDone ? \'text-success\' : \'text-danger\'\">{{message.blogDeleted}}</h4>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("blog-edit.list.tpl.html","<div class=\"container\">\r\n    <div class=\"row\">\r\n        <div class=\"col-lg-7 col-lg-offset-2 col-md-10 col-md-offset-1 blog-main\">\r\n            <div ng-repeat=\"blog in blogs\">\r\n\r\n                <div class=\"post-preview\" ng-if=\"blogs\">\r\n\r\n                    <h2 class=\"post-title\">\r\n                        {{blog.title}}\r\n                    </h2>\r\n\r\n                    <h3 class=\"post-subtitle\" ng-if=\"blog.subtitle\">\r\n                        {{blog.subtitle}}\r\n                    </h3>\r\n\r\n                    <div class=\"row\">\r\n                        <div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-6\">\r\n                            <span class=\"glyphicon glyphicon-pencil\" ng-morph-overlay=\"blogEditSettings\" ng-click=\"loadBlog(blog)\" style=\"font-size: 1.3em; z-index: 0 !important;\"></span>\r\n                        </div>\r\n                        <div class=\"col-lg-8 col-md-6 col-sm-4 col-xs-6\">\r\n\r\n                        </div>\r\n                        <div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-6\">\r\n                            <span class=\"glyphicon glyphicon-remove pull-right\" ng-morph-modal=\"deleteBlogSettings\" ng-click=\"loadBlogToDelete(blog)\" style=\"font-size: 1.3em;\"></span>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"post-meta\">Posted by <a ng-href=\"/#/blogs\">{{username}}</a> on {{getFormattedDate(blog)}}</div>\r\n                    <div class=\"post-meta\"><i class=\"fa fa-tags\"></i> <em ng-repeat=\"tag in blog.tags\"><a class=\"tag-link\" ng-href=\"/#/blogs/tags/{{tag}}\">{{tag}}</a>{{$last ? \'\' : \', \'}}</em></div>\r\n\r\n                </div>\r\n                <hr>\r\n            </div>\r\n            <ul class=\"pager\">\r\n                <li class=\"previous hvr-sweep-to-right\">\r\n                    <a href=\"#\" ng-if=\"!isFirstPage()\" ng-click=\"prev()\" class=\"hvr-sweep-to-right\">Previous</a>\r\n                </li>\r\n                <li class=\"next\">\r\n                    <a href=\"#\" ng-if=\"!isLastPage()\" ng-click=\"next()\" class=\"hvr-sweep-to-right\">Next</a>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n        <div class=\"col-lg-3 col-md-6 col-xs-12\">\r\n            <div class=\"nav-block affix\" style=\"margin-top: 15px;\">\r\n                <div class=\"row\">\r\n                    <div class=\"col-lg-2 col-md-12 col-sm-12 col-xs-12\">\r\n                        <input type=\"text\" class=\"form-control\" ng-model=\"query\" placeholder=\"Type your query here\">\r\n                    </div>\r\n                    <div class=\"col-lg-2 col-md-12 col-sm-12 col-xs-12 center-block\">\r\n                        <button class=\"btn btn-default center-block\" ng-click=\"search()\">Search</button>\r\n                    </div>\r\n                </div>\r\n                <div class=\"row\">\r\n                    <div class=\"col-lg-4 col-md-12 col-sm-12 col-xs-12\">\r\n                        <hr>\r\n                    </div>\r\n                </div>\r\n                <div class=\"row\">\r\n                    <div class=\"col-lg-2 col-md-12 col-sm-12 col-xs-12 center-block\">\r\n                        <button class=\"btn btn-default center-block\" ng-morph-overlay=\"blogEditSettings\" ng-click=\"addBlog()\">Add Blog</button>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("blog-edit.post.tpl.html","<div class=\"container\" style=\"background-color:#f8f8ff;\" id=\"post-edit\">\r\n    <div class=\"row\" style=\"margin-top: 10px;\">\r\n        <div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-6\">\r\n            <span class=\"glyphicon glyphicon-floppy-disk\" ng-click=\"saveBlog(blogToEdit)\" style=\"font-size: 1.8em; margin-left: -20px;\"></span>\r\n        </div>\r\n        <div class=\"col-lg-8 col-md-6 col-sm-4 col-xs-12 text-center\">\r\n            <span style=\"font-family: avenir, \'avenir next\', helvetica,arial, sans-serif;\" ng-if=\"verify.blogSaved || error.blogSaved\" ng-class=\"verify.blogSaved ? \'text-success\' : \'text-danger\'\">\r\n                {{message.blogSaved}}\r\n            </span>\r\n        </div>\r\n        <div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-6\">\r\n            <span class=\"pull-right glyphicon glyphicon-remove close\" ng-click=\"purgeEditScopeVar()\" style=\"font-size: 1.8em; margin-right: -20px;\"></span>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-lg-6 col-md-12 col-sm-12 col-xs-12\" style=\"margin-left: -10px; margin-right: 10px;\">\r\n            <div class=\"row\">\r\n                <div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center edit-post-column-header\">\r\n                    <span>Edit</span>\r\n                </div>\r\n            </div>\r\n            <div class=\"row\">\r\n                <textarea class=\"form-control col-lg-12 col-md-12 col-sm-12 col-xs-12\" ng-change=\"getPreviewBlog(blogToEdit)\" ng-model=\"blogToEdit.post\" style=\"height: 85vh; width: 100%; color: black; border: 5px black solid;\"></textarea>\r\n            </div>\r\n        </div>\r\n        <div class=\"col-lg-6 col-md-12 col-sm-12 col-xs-12\" style=\"margin-left: 10px; margin-right: -10px;\">\r\n            <div class=\"row\">\r\n                <div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center edit-post-column-header\">\r\n                    <span>Preview</span>\r\n                </div>\r\n            </div>\r\n            <div class=\"row\">\r\n                <div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12\" style=\"height: 85vh; width: 100%; overflow: auto; border: 5px black solid;\">\r\n                    <h1>{{previewBlog.title}}</h1>\r\n                    <h2 class=\"post-subtitle\" ng-if=\"previewBlog.subtitle\">\r\n                        {{previewBlog.subtitle}}\r\n                    </h2>\r\n                    <div post=\"previewBlog.post\"></div>\r\n                    <br>\r\n                    <em class=\"post-meta\">Posted by <a ng-href=\"/#/blogs\">{{username}}</a> on {{previewBlog[\'published-date\']}}</em>\r\n                    <div class=\"post-meta\"><i class=\"fa fa-tags\"></i> <em ng-repeat=\"tag in previewBlog.tags\"><a class=\"tag-link\">{{tag}}</a>{{$last ? \'\' : \', \'}}</em></div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>");}]);