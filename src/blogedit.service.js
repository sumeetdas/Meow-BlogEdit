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