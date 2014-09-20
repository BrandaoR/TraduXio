function(work, req) {
  var doc=work;
  //!code lib/traduxio.js

  var args = JSON.parse(req.body);
  if(args.key == "remove") {
	work._deleted = true;
	return [work, "document removed"];
  }
  if (work===null) {
    Traduxio.doc=doc=work=args;
    work._id=work.id || req.id || req.uuid;
    work.creator=work["work-creator"];
    delete work["work-creator"];
    if (work.original) {
        work.text=work.text || [];
        work.translations={};
    } else {
        delete work.text;
        work.translations={"first":{text:[]}};
    }
    work.edits=[];
    Traduxio.addActivity(work.edits,{action:"created"});
    return [work, JSON.stringify({ok:"created",id:work._id})];
  }
  var version = req.query.version;
  if(args.key == "delete") {
	delete work.translations[version];
  Traduxio.addActivity(work.edits,{action:"deleted",version:version});
	return [work, version + " deleted"];
  }
  var doc;
  work.edits=work.edits || [];
  if(version == "original") {
	doc = work;
  } else {
	if(!work.translations[version]) {
	  var l = 1;
	  if (work.text) l=work.text.length;
	  else if (work.translations) {
	    for (var t in work.translations) {
	      if (work.translations[t].text) {
	        l=Math.max(l,work.translations[t].text.length);
	      }
	    }
	  }
	  var text=[];
	  for(var i=0 ; i<l ; i++) {
		  text.push("");
	  }
	  work.translations[version] = { title: work.title, language: work.language, text: text };
    Traduxio.addActivity(work.edits,{action:"created",version:version});
	}
	doc = work.translations[version];
  }
  Traduxio.addActivity(work.edits,{action:"edited",version:version,key:args.key,value:args.value});
  if(args.key == "work-creator") {
	doc.creator = args.value;
  } else if(args.key == "creator") {
	var name = args.value;
	if(name == undefined) {
	  name = "Unnamed document";
	}
	if(name != version) {
	  while(work.translations[name] || name == "original" || name.length == 0) {
		name += "(2)";
	  }
	  work.translations[name] = doc;
	  delete work.translations[version];
	  return [work, name];
	} else {
	  return [work, version];
	}
  } else {
	doc[args.key] = args.value;
  }
  return [work, typeof args.value=="string"?args.value:JSON.stringify(args.value)];
}
