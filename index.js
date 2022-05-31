/* global hexo */
'use strict';
hexo.log.info(`---------------------`);

// // hexo config
// hexo.extend.console.register('config', 'Display configuration', function (args) {
//     console.log(hexo.config);
// });

const yfm = require("hexo-front-matter");
const config = hexo.config;

const gen_tags = function (tags) {
    let tagStr = "";
    // isArray
    if (tags.constructor === Array) {
        tagStr = tags.join(",");
    }
    // isString
    else if (tags.constructor === String) {
        tagStr = tags;
    }
    // 逗号前后去空格
    tagStr = tagStr.replace(/\s*([,，])\s*/g, ",");
    return tagStr.split(",");
}

hexo.extend.processor.register("_posts/*path.md", function (file) {
    // console.log("-----");
    // console.log(file);

    const Post = hexo.model('Post');
    // 定义变量
    let data = {};
    data.source = file.path;
    data.slug = file.params.path;
    data.fixTags = true;
    return Promise.all([
        file.stat(),
        file.read()
    ]).then(fileInfo => {
        // console.log(fileInfo[0]);
        // console.log(fileInfo[1]);

        // 合并 data
        data = Object.assign(data, yfm.parse(fileInfo[1]));
        data.tags = gen_tags(data.tags);
        data.categories = data.categories || [config.default_category];

        // console.log(data);

        return Post.insert(data);
    }).then(function (doc) {
        return Promise.all([
            doc.setCategories(data.categories),
            doc.setTags(data.tags),
        ]);
    });
});

// hexo.extend.tag.register('first_plugin', function () {
//     return '<p>This is my first hexo plugin.</p>';
// });

// hexo.extend.filter.register('before_post_render', function (data) {
//     hexo.log.info("before_post_render -------------");
//     hexo.log.info(data.tags);
//     data.content = "empty";
//     return data;
// }, 10);

hexo.extend.filter.register('before_generate', function (data) {
    // before_generate
    hexo.log.info("before_generate -------------");

    this._bindLocals();

    // 过滤旧的文章
    const all_posts = this.locals.get('posts');

    // console.log(all_posts);
    hexo.log.info(all_posts.length);
    const normal_posts = all_posts.filter(post => post.fixTags);

    // console.log(normal_posts);
    hexo.log.info(normal_posts.length);

    this.locals.set('posts', normal_posts);

    // const all_tags = this.locals.get('tags');
    // hexo.log.info(all_tags.length);
});