function openPageInTab(title, url) {
    var pp = window || document;
    while (pp.parentWindow != undefined) {
        pp = pp.parentWindow.parent;
    }
    while (pp.parent != undefined && pp != pp.parent) {
        pp = pp.parent;
    }
    title = encodeURI(title);
    url = encodeURI(url);
    var d = { 'title': title, 'url': url };
    pp.postMessage(d, "*");
}