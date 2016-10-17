var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var superagent = require('superagent');

var sourceUrl = "http://lengxiaohua.com/new";
var baseUrl = "http://lengxiaohua.com/joke/";
var urls = new Map();
var count = 0;
superagent
	.get(sourceUrl)
	.end(function(err,res){
			if(res.status==200){
				var $ = cheerio.load(res.text);
				var maxPage = $(".joke_wrap").children().eq(1)[0].attribs.fx.split("pagination")[1].split(";")[1].split("=")[1];
				for(var i= 0;i<maxPage;i++){
					var query = {"page_num":i+1};
					superagent
						.get(sourceUrl)
						.query(query)
						.end(function(err,res){
							if(res != undefined){
								var $ = cheerio.load(res.text);
								var joker_num = $(".joke_li")[0].attribs.id.replace(/[^0-9]/ig,"");
								var url = baseUrl + joker_num;
								superagent
									.get(url)
									.end(function(err,res){
										var $ = cheerio.load(res.text,{decodeEntities: false});
										// console.log($("#joke_content_226343").children().html());
										count++;
										console.log(count);
										urls.set(joker_num,true);
									})
							}	
						})
			}
		}

	});

