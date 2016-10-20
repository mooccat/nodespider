var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var superagent = require('superagent');
var async = require('async');

var sourceUrl = "http://lengxiaohua.com/new";
var baseUrl = "http://lengxiaohua.com/joke/";
var urls = [];
var count = 0;
var num = 0;

var async = require('async');

async.waterfall([getMaxPage,getQuery],function(err,result){
	console.log(urls);
	async.mapLimit(urls,4,getSource,function(err,res){
		console.log(res);
	});
});

function getMaxPage(cb){
	superagent
		.get(sourceUrl)
		.end(function(err,res){
			var $ = cheerio.load(res.text);
			var maxPage = $(".joke_wrap").children().eq(1)[0].attribs.fx.split("pagination")[1].split(";")[1].split("=")[1];
			cb(null,maxPage);
		})	
}

function getQuery(maxPage,cb){
	var querys = [];
	for(var i=0;i<maxPage;i++){
		var query = {"page_num":i+1};
		querys.push(query);
	}
	async.mapLimit(querys,5,getUrl,function(err,result){
		cb(null,"get query done");
	});
}

function getUrl(query,cb){
	count++;
	console.log("现在正在抓取待抓取url并发数："+count);
	superagent
		.get(sourceUrl)
		.query(query)
		.end(function(err,res){
			if(res != undefined && res.status==200){
				var $ = cheerio.load(res.text);
				for(var i=0;i<$(".joke_li").length;i++){
					var joker_num = $(".joke_li")[i].attribs.id.replace(/[^0-9]/ig,"");
					// var url = baseUrl + joker_num;
					// urls.set(joker_num,false);
					urls.push(joker_num);
					// count++;
					// console.log("现在正在抓取："+url+";"+"并发数："+count);
					// superagent
					// 	.get(url)
					// 	.end(function(err,res){
					// 		var $ = cheerio.load(res.text,{decodeEntities: false});
					// 		var id = "#joke_content_"+joker_num;
					// 		console.log($(id).children().html());
					// 		urls.set(joker_num,true);
					// 		count--;
					// 	})
				}
				count--;
				cb(null,"get url done");
			}	
		})
}


function getSource(urlFragment,cb){
			var url = baseUrl + urlFragment;
			superagent
				.get(url)
				.end(function(err,res){
					var $ = cheerio.load(res.text,{decodeEntities: false});
					var id = "#joke_content_"+urlFragment;
					console.log($(id).children().html());
					num++;
					console.log(num);
					fs.appendFile('joker/lengxiaohua.txt',$(id).children().html(),function(err){
						if(err){
							throw err;
						}
					});
					// urls.set(urlFragment,true);
					cb(null,"done");
				})
	}


