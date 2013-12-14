
  $.fn.toggleName = function(name1, name2) {
    this.val(
      (this.val()==name1)? name2 : name1
    );
  }

  function find(version) {
    return $(".pleat.open[data-version='"+version+"']");
  }

  function findPleat(version) {
    return $(".pleat.close[data-version='"+version+"']");
  }

  $.fn.getHeight = function() {
    var fake=$("<div>").css({"position":"fixed","left":"-1000px"}).append(this.clone());
    $(document.body).append(fake);
    var height=fake.outerHeight();
    fake.remove();
    return height;
  }

  $.fn.rotate = function () {
    return $("<div>").addClass("rotated-text__wrapper").append(
      $("<div>").addClass("rotated-text").append(this)
    );
  }

  function addPleat(version) {
    var header=find(version).filter("th").first();
    var pleat=$("<td/>").addClass("pleat").addClass("close").attr("rowspan",$("tbody tr").length).attr("data-version",version);
    var language=header.find(".language").clone(true,true);
    language.attr("title",language.html()).html(language.data("id")).removeClass("expand");
    pleat.append(language.rotate());
    pleat.append(header.find(".creator").clone(true,true).rotate());
    find(version).filter("td").first().after(pleat);
    var pleatHead=$("<th/>").addClass("pleat").addClass("close").append(
       $("<div>").addClass("relative-wrapper").append(
            $("<span>").addClass("button show").html("Montrer")
       )
    ).attr("data-version",version);
    header.after(pleatHead);
    var pleatFoot=$("<th/>").addClass("pleat").addClass("close").attr("data-version",version);
    find(version).last().after(pleatFoot);
  }

  function findUnits(version) {
    return find(version).find(".unit");
  }

  function getVersions() {
    var versions=[];
    $("#hexapla .header tr:first-child .pleat.open").each(function() {
      versions.push($(this).data("version"));
    });
    return versions;
  }

  function positionPleats() {
    var closedPleats=$(".pleat.close:visible");
    //pleats positioning is done automatically with FF23 and Chromium 28
    //chromium has a bug, which requires to redraw the fixed elements
    closedPleats.children(":visible").redraw();
    return;
  }

  //http://forrst.com/posts/jQuery_redraw-BGv
  $.fn.redraw = function() {
    return this.hide(0, function(){$(this).show()});
  };

  function toggleShow(version) {
    find(version).toggle();
    findPleat(version).toggle();
    positionPleats();
  }

  $.fn.isEdited = function() {
    return this.find("textarea").length>0;
  }

  function htmlToString(unit) {
    return unit.html()
      .replace(/<br\/?>/g, "\n").replace("&lt;","<").replace("&gt;",">");
  }

  function stringToHtml(formattedString) {
     return formattedString.replace("<","&lt").replace(">","&gt;").replace(/\n$/,"\n ").replace(/\n/g, "<br>");
  }

  $.fn.getVersion = function(ancestor) {
    return this.closest(ancestor).data("version");
    return $(ancestor,$(this).closest("tr")).index($(this).closest(ancestor)) +1 ;
  }

  $.fn.getReference = function() {
    return {
      version: this.closest(".unit").data("version"),
      line: this.closest("tr").data("line")
    }
  }
  
  $.fn.getLine = function() {
    return this.closest("tr").data("line");
  }

  $(document).ready(function() {

    $("#hexapla").on("click", ".pleat.open .button", function() {
      if ($("thead.header th.pleat.open:visible").length > 1) {
        toggleShow($(this).getVersion("th.open"));
      }
    });

    $("#hexapla").on("click", ".pleat.close .button", function() {
      toggleShow($(this).getVersion("th.close"));
    });

    var getEndLine=function (units,index) {
      var nextIndex=index+1;
      var lastLine=0;
      if (nextIndex<units.length) {
	var nextUnit=units.eq(nextIndex);
	lastLine=nextUnit.getReference().line - 1 ;
      } else {
	lastLine=$("#hexapla").data("lines") - 1;
      }
      return lastLine;
      
    }
   
    var getSize=function(unit) {
      var rowspan=unit.closest("td").attr("rowspan");
      if (rowspan) return parseInt(rowspan); 
      else return 1;
    }

    var createJoin=function(unit1,unit2) {
        var p=($(unit2).offset().top-$(unit1).offset().top-$(unit1).outerHeight()+32)/(-2);
        var join=$("<span/>").addClass("join").attr("title","merge with previous").css("top",p+"px");
        unit2.prepend(join);
    }


    var createJoins=function(unit) {
      unit.find(".join").remove();
      var version=unit.getVersion("td.open");
      var units=findUnits(version);
      var currIndex=units.index(unit);
      if (currIndex>0) {
	var prevUnit=units.eq(currIndex-1);
	createJoin(prevUnit,unit);
      }
    }
    var createSplits=function(unit) {
      unit.find(".split").remove();
      var reference=unit.getReference();
      var version=reference.version;
      var currLine=reference.line;
      var units=findUnits(version);
      var currIndex=units.index(unit);
      var size=getSize(unit);
      var lastLine=currLine+size-1;
      var maxLines=$("#hexapla").data("lines");
      var currPos=unit.position();
      if (currLine<lastLine && currLine<maxLines) {
	for (var i=currLine+1; i<=lastLine; ++i) {
	  var split=$("<span/>").addClass("split").attr("title","split").data("line",i);
	  var position=$("tr[data-line="+i+"]").position();
	  split.css("top",(position.top-currPos.top)+"px");
	  unit.append(split);
	}
      }
    }
    var toggleEdit=function () {
      $(this).toggleName("Lire", "Editer");
      var version=$(this).getVersion("th.open");
      var units = findUnits(version);
      if (units.isEdited()) {
        find(version).first().css("width","auto");
      } else {
        find(version).first().css("width",find(version).first().outerWidth()+"px");
      }
      units.each(function() {
        var unit=$(this);
        if ($(this).isEdited()) {
          $(this).html(stringToHtml($(this).find("textarea").val()));
          unit.find(".split").remove();
          unit.find(".join").remove();
          unit.removeClass("edit");
        } else {
	  $(this).addClass("edit").find("span").remove();
	  var textarea=$("<textarea/>");
	  textarea.val(htmlToString($(this)));
	  $(this).empty().append(textarea).append("<div class='textcopy'/>");
          autoSize.apply(textarea);
          if (getVersions().indexOf(version)>0) {
            createJoins(unit);
            createSplits(unit);
          }
        }
      });
    }

    $(".edit").on("click",toggleEdit);

    var editOnServer = function(content, reference) {
      var id=$("#hexapla").data("id");
      return $.ajax({
        type: "PUT",
        url: "version/"+id+"?"+ $.param(reference),
        contentType: "text/plain",
        data: content
      });
    }
   
    var getPreviousUnit=function(unit) {
      var version=unit.getVersion("td.open");
      var units=findUnits(version);
      return $(units.eq(units.index(unit)-1));
    }

    $("tr").on("click", ".join", function(e) {
      e.stopPropagation();
      var unit=$(this).closest(".unit");
      var version=unit.getVersion("td.open");
      var units=findUnits(version);
      var previousUnit=units.eq(units.index(unit)-1);
      if (previousUnit) {
	editOnServer("null", $(this).closest(".unit").getReference())
	  .done(function() {
            var previousContent=previousUnit.find("textarea").val();
            var thisContent=unit.find("textarea").val();
            previousUnit.find("textarea").val(previousContent+"\n"+thisContent);
            var thisLine=unit.getLine();
            var prevLine=previousUnit.getLine();
            var size=getSize(unit);
            var newSpan=thisLine-prevLine+size;
            previousUnit.closest("td").attr("rowspan",newSpan);
            unit.closest("td").remove();
            createJoins(previousUnit);
            createSplits(previousUnit);
        });
      }
    });

    $("tr").on("click", ".split", function(e) {
      e.stopPropagation();
      var unit=$(this).closest(".unit");
      var line=$(this).data("line");
      var version=unit.data("version");
      editOnServer("", {
        version:version,
        line: line
      }).done(function() {
        var size=getSize(unit);
        var initialLine=unit.getLine();
        var newUnit=$("<div/>").append("<textarea>").append("<div class='textcopy'/>");
        autoSize.apply($("textarea",newUnit));
        newUnit.addClass("unit edit").attr("data-version",version);
        $(this).remove();
        var newTd=$("<td>").addClass("pleat open").attr("data-version",version).attr("rowspan",size-(line-initialLine)).append(newUnit);
        unit.closest("td").attr("rowspan",line-initialLine);
        var versions=getVersions();
        var versionIndex=versions.indexOf(version);
        if (versionIndex==0) {
	  $("tr[data-line="+line+"]").prepend(newTd);
        } else {
	  var ok=false;
	  $("tr[data-line="+line+"] .unit").each(function() {
            var currVersion=$(this).data("version");
	    if (versions.indexOf(currVersion) > versions.indexOf(version)) {
	      $(this).closest("td").before(newTd);
	      ok=true;
	      return false;
	    }
	    if (versions.indexOf($(this).data("version")) +1 == versions.length) {
	      $(this).closest("td").before(newTd);
	    }
	  });
          if (!ok) {
	    $("tr[data-line="+line+"]").append(newTd);
          }
        }
        createJoins(unit);
        createSplits(unit);
        createJoins(newUnit);
        createSplits(newUnit);
        $(".tosplit").removeClass("tosplit");
      });
    });

    var autoSize=function() {
      // Copy textarea contents; browser will calculate correct height of copy,
      // which will make overall container taller, which will make textarea taller.
      var text = stringToHtml($(this).val());
      $(this).parent().find("div.textcopy").html(text);
      $(this).css({'width':'100%','height':'100%'});
      console.log("autosize");
    }
    
    var modified=function() {
      $(this).addClass("dirty");
      autoSize.apply(this);
    }

    $("#hexapla").on('change keyup keydown input cut paste','textarea',modified);

    var unedit=function() {
      var unit=$(this).closest(".unit");
      saveUnit.apply(unit,function() {
         $(unit).html(stringToHtml(content)).removeClass("edit");
      });
    }

    var saveUnit=function(callback) {
      var content=$(this).find("textarea").val();
      editOnServer(content, $(this).getReference()).done(function() {
        if (callback) {
           callback();
        }
      });
    }

    $("tr").on("focusout", ".unit.edit textarea", unedit);
    
    var versions=getVersions();
    const N = versions.length;
    for (var i = N-1; i>=0; i--) {
      addPleat(versions[i]);
    }
    for (var i = 2; i<N; i++) {
      toggleShow(versions[i]);
    }

  });


