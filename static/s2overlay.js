// https://arxiv.org/abs/1705.10311

var gdata;

var URL_S2_API = 'http://api.semanticscholar.org/v1/';
var URL_ASSESTS = 'http://127.0.0.1:8000/static/';

function min(a, b){return (a < b) ? a : b;}
function max(a, b){return (a > b) ? a : b;}

function url_s2_paper(id)   {return URL_S2_API+'paper/arXiv:'+id;}
function url_s2_paperId(id) {return URL_S2_API+'paper/'+id;}
function url_s2_author(id)  {return URL_S2_API+'author/'+id;}
function url_asset(file)    {return URL_ASSESTS+file;}

function current_article(){
    var url = $(location).attr('href');
    var re_url = new RegExp('^http(?:s)?://arxiv.org/abs/(\\d{4}\\.\\d{4,5})$');
    var match = re_url.exec(url);

    if (!match)
        $.fail(function (err) {console.log("sup erbad");});

    return match[1];
}

function is_loaded(){
    if (typeof _s2overlayed !== 'undefined')
        return true;
    _s2overlayed = true;
    return false;
}

function load_css(callback){
    $('<link>')
        .appendTo('head')
        .attr({
            type: 'text/css', 
            rel: 'stylesheet',
            href: url_asset('style.css'),
            onload: callback
        });
}

function load_data(url, callback, failmsg){
    $.get(url, callback)
     .fail(function(err) {
         alert(failmsg);
     });
}

function gogogo(){
    /*if (is_loaded())
        return;*/

    load_css(function(){
        var url = url_s2_paper(current_article());
        console.log(url);
        load_data(url, draw_overlays, 'S2 unavailable');
    });
}

function draw_overlays(data){
    gdata = data;
    function _authors(ref, base){
        var url = url_s2_paperId(ref.paperId);
        load_data(url,
            function(data) {
                var len = data.authors.length;
                var elem = $('<div>').addClass('mkb-authors');

                for (var j=0; j<len; j++){
                    $('<a>')
                        .appendTo(elem)
                        .attr('href', data.authors[j].url)
                        .text(data.authors[j].name);
                }

                base.append(elem);
            },
            'Could not find paper "'+ref.title+'"'
        );
    }

    function _elem(ref){
        return $('<div>')
            .addClass('mkb-paper')
            .append(
                $('<a>')
                  .attr('href', ref.url)
                  .text(ref.title)
            );
    }

    function create_column(column, references, anchorbase, anchorlink){
        var len = references.length;
        for (var i=0; i<min(5, len); i++){
            var e = _elem(references[i]);
            _authors(references[i], e);
            column.append(e);
        }

        $('<h2>')
            .appendTo(column)
            .css('text-align', 'center')
            .append(
                $('<a>').attr('href', link+anchorlink).text('...')
            )
    }

    var link = data.url;
    var cl = $('<div>');
    var cr = $('<div>');
    cl.append($("<h2>References</h2>"));
    cr.append($("<h2>Citations</h2>"));

    create_column(cl, data.references, link, '#citedPapers');
    create_column(cr, data.citations, link, '#citingPapers');

    /*var link_element_l = $('<a>').attr('href', link+'#citedPapers').text('...')
    var link_element_r = $('<a>').attr('href', link+'#citingPapers').text('...')

    // The '...' links going to the main paper page on S2
    $('<h2>').
        appendTo(cl)
        .css('text-align', 'center')
        .append(link_element_l)

    $('<h2>').
        appendTo(cr)
        .css('text-align', 'center')
        .append(link_element_r)*/

    // Add all of the columns just below the submission history
    $('<div>')
        .insertBefore($('.submission-history'))
        .addClass('mkb-col2')
        .append(cl)
        .append(cr)
}

gogogo();

