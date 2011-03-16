if (typeof console == "undefined") console={log:function(){}};

(function($) {
    
    $.getDocHeight = function(){
      //  alert('1 getdocheight');
    return Math.max(
        $(document).height(),
        $(window).height(),
        /* For opera: */
        document.documentElement.clientHeight
        );
    };
    
    tdxio.array = {
        trShift : function(trArray,id,selected){
            var index = 0;
            var L = trArray.length;
            
            var newArray = [];
            var firstItem = [];
            
            for(var i = 0; i<L; i++){
                if(trArray[i].work.id==id){
                    index = i;
                    break;
                }
            }
            if(selected==false){
                firstItem = trArray.splice(0,1);
            }            
            newArray = trArray.splice(index,L);          
            if(trArray.length>0)
                newArray = firstItem.concat(newArray.concat(trArray));                
                     
            return newArray;
        }
    }
        
    tdxio.page = {
        resize: function(){
            /*      var D = $.getDocHeight();
            //alert('D: '+D);
            $('div#book').height(D-$('#header').outerHeight()-$('#under-header').outerHeight()-$('.background').css('padding-top')-$('.footer').outerHeight()-$('div.tag-line').outerHeight());
            */
            // 1. Make the height of the translation and of the work texts the same
            if($('#translation .text').height() > $('#work .text').height()){
                $('#work .text').height($('#translation .text').height());
            }else{
                $('#translation .text').height($('#work .text').height());
            }
            //$('#translation .text,#work .text').height(Math.max($('#translation .text').height(),$('#work .text').height()));

            //maxheight = Math.max($('div#work').height(),$('div#translation'));
            //2. Then (div#work and div#translation should have the same height)...
            if($('div#work').height()!=$('div#translation').height()){
                alert('Change the code! #work and #translation have different heights');
            }
            // ... change the borders' height
            $('div.Rborder, div.Lborder').height($('div#work').height());
            
            
            /*$('#translation .text').height($('#work .text#'+id).height());
            var id = $('#translation .text').attr('id');
            for(var j=0; j<$('#translation .text').length; j++){
            if(id){
                $('#translation .text').height($('#work .text#'+id).height());
            }
            }*/
            //$('.page-container div#translation').height(maxheight);
            //$('#book').height($('.page-container').height());
        },
        
        turn: function(dir,index){
            begin = parseInt(index);
            //alert(begin +' '+(dir=='prev-page'));
            tdxio.page.displayWork(ajaxData,trId,(dir=='prev-page'));
            tdxio.page.resize();
        },
        /*
        writeTranslation:function(sentences, trWork, step){
            $('div#translation').attr('dir',(trWork.work.rtl==1)?'rtl':'');
            var len = trWork.blocks.length;
            
            var preblock = "<span id='block";
            $('#test').width($('#translation div.text').width());
            $('#translation div.text').empty();
            $('#work div.text').empty();
            $('#test').empty();
            $('#translation div.text').append(preblock + begin + "'>" + trWork.blocks[begin].translation +"</span>");
            for(var x=trWork.blocks[begin].from_segment; x<=trWork.blocks[begin].to_segment; x++){
                        $('#work div.text').append(pre + x +"'>" + sentences[x].content +"</span>");
                    }
                    $('#test').append(preblock + begin + "'>" + trWork.blocks[begin].translation +"</span>");
                    if(backward===false){  
                        var i;
                        if(begin+1<len){
                            $('#test').append(preblock + (begin +1) + "'>" + trWork.blocks[begin+1].translation +"</span>");
                        }
                        $('#next-page img').attr('id',begin);
                        
                        for(i=begin+1; i<len && $('#test').height()<= maxH ; i++){
                            $('#translation div.text').append(preblock + i + "'>" +trWork.blocks[i].translation + "</span>");
                            for(var x=trWork.blocks[i].from_segment; x<=trWork.blocks[i].to_segment; x++){
                                $('#work div.text').append(pre + x +"'>" + sentences[x].content +"</span>");
                            }
                            if(i+1<len){
                                $('#test').append(preblock + (i+1) + "'>" +trWork.blocks[i+1].translation + "</span>");
                            }
                        }
                        $('#next-page img').attr('id',(i<len)?i:0);
                        $('#prev-page img').attr('id',(begin > 0) ? begin-1 : 0);
                        $('#next-page img').css('visibility',(i<len-1)?'visible':'hidden');                           
                        $('#prev-page img').css('visibility',(begin > 0)?'visible':'hidden');
                        back=false;  
            
            
        }*/
        writeWork: function(sentences,from,to, step){
            var pre = "<span id='text"+data.work.id +"-segment";
            for(var x=from; x<=to; x+=step){
                $('#work div.text').append(pre + x +"'>" + sentences[x].content +"</span>");
            }
        },
        
        displayWork: function(data,trId,backward){//begin and end represent segments or sentences numbers
            if(data.work.Sentences.length > 0){
                $('div.text').height("");
                $('div#test').height("");
                $('#test').width($('#work div.text').width());
                $('#work div.text').empty();
                $('#test').empty();    
                $('#translation div.text').empty();                

                var sentences = data.work.Sentences;
                    //before there was $(window).height() instead of getDocHeight
                var maxH = Math.max(minHeight,$.getDocHeight()-$('#header').outerHeight()-$('.footer').outerHeight()-$('#under-header').outerHeight()-($('.tag-line').outerHeight()+15)-$('.work-title').outerHeight()-$('.Tborder').height()-$('.Bborder').height()-$('#work div.text').outerHeight() +$('#work div.text').height()-60);
                var next = 0;//data.work.Sentences[0].number;
                var pre = "<span id='text"+data.work.id +"-segment";
                
                //if(data.work.Interpretations.length == 0){// there are no translations
                if(trId == ''){// there are no translations
                    //display only the work
                    var len = sentences.length;
                    
                    $('#translation .text').append("<span class='text'>Create a translation</span>"); 
                    $('#test').append(pre + sentences[begin].number + "'>" + sentences[begin].content + "</span>");
                    
                    if(backward===false){    
                        //alert('one:'+begin);
                        var i;
                        $('#next-page img').attr('id',begin);
                        
                        for(i=begin; (i==begin) || (i<len && $('#test').height()<= maxH) ; i++){
                            $('#work div.text').append(pre + sentences[i].number + "'>" +sentences[i].content + "</span>");
                          if(i+1<len){
                                $('#test').append(pre + sentences[i+1].number + "'>" +sentences[i+1].content + "</span>");
                            }
                        }
                        $('#next-page img').attr('id',(i<len)?i:0);
                        $('#next-page img').css('visibility',(i<len)?'visible':'hidden');
                        $('#prev-page img').attr('id',(begin > 0) ? begin-1 : 0);                           
                        $('#prev-page img').css('visibility',(begin > 0)?'visible':'hidden');
                    }else{
                        var i;
                        $('#prev-page img').attr('id',begin);
                        
                        for(i=begin; (i==begin)|| (i>=0 && $('#test').height()<= maxH) ; i--){
                            $('#work div.text').prepend(pre + sentences[i].number + "'>" +sentences[i].content + "</span>");
                            if(i-1>=0){
                                $('#test').prepend(pre + sentences[i-1].number + "'>" +sentences[i-1].content + "</span>");
                            }
                        }
                        $('#next-page img').attr('id',(begin+1 <len ) ? begin+1 : 0);
                        $('#next-page img').css('visibility',(begin+1<len)?'visible':'hidden'); 
                        $('#prev-page img').attr('id',(i>0)?i:0);                          
                        $('#prev-page img').css('visibility',(i > 0)?'visible':'hidden');
                        back=true;
                    }              
                }else{
                    trWork = data.work.Interpretations[0];
                    
                    for(var j=0;j<data.work.Interpretations.length; j++){
                        if(data.work.Interpretations[j].work.id==trId)
                            trWork = data.work.Interpretations[j];
                    }
                    $('#translation .work-title span.author').html((trWork.work.author!=null)?trWork.work.author +', ':'');
                    $('#translation .work-title span.title').html(trWork.work.title);                    
                    $('div#translation').attr('dir',(trWork.work.rtl==1)?'rtl':'');
                    var len = trWork.blocks.length;
                    var preblock = "<span id='block";
                    
                    var beginBlock=0;
                    for(var y=0;y<len;y++){
                        if(begin>=trWork.blocks[y].from_segment && begin<=trWork.blocks[y].to_segment){
                            beginBlock = y;
                            break;
                        }
                    }      
                    $('#test').append(preblock + beginBlock + "'>" + trWork.blocks[beginBlock].translation +"</span>");
                    if(backward===false){  
                        var i;
                        begin = trWork.blocks[beginBlock].from_segment;
                        $('#next-page img').attr('id',begin);
                        $('#next-page a').attr('href','#tr'+trId);
                        for(i=beginBlock;(i==beginBlock) || ( i<len && $('#test').height()<= maxH) ; i++){
                            $('#translation div.text').append(preblock + i + "'>" +trWork.blocks[i].translation + "</span>");
                            for(var x=trWork.blocks[i].from_segment; x<=trWork.blocks[i].to_segment; x++){
                                $('#work div.text').append(pre + x +"'>" + sentences[x].content +"</span>");
                                $('#test').append(pre + x +"'>" + sentences[x].content +"</span>");
                            }
                            if(i+1<len){
                                $('#test').append(preblock + (i+1) + "'>" +trWork.blocks[i+1].translation + "</span>");
                            }
                        }
                        $('#next-page img').attr('id',(i<len)?trWork.blocks[i].from_segment:0);
                        $('#next-page img').css('visibility',(i<len)?'visible':'hidden');                           
                        $('#prev-page img').attr('id',(beginBlock > 0) ? begin-1 : 0);
                        $('#prev-page img').css('visibility',(beginBlock > 0)?'visible':'hidden');
                        back=false;                        
                    }else{
                        var i;
                        begin = trWork.blocks[beginBlock].to_segment;
                        $('#prev-page img').attr('id',begin);
                        $('#prev-page a').attr('href','#tr'+trId);
                        for(i=beginBlock; (i==beginBlock) || (i>=0 && $('#test').height()<= maxH) ; i--){
                            $('#translation div.text').prepend(preblock + i + "'>" +trWork.blocks[i].translation + "</span>");
                            for(var x=trWork.blocks[i].to_segment; x>=trWork.blocks[i].from_segment; x--){
                                $('#work div.text').prepend(pre + x +"'>" + sentences[x].content +"</span>");
                            }
                            if(i-1>=0){
                                $('#test').prepend(preblock + (i-1) + "'>" +trWork.blocks[i-1].translation + "</span>");
                            }
                        }
                        $('#prev-page img').attr('id',(i>=0)?trWork.blocks[i].to_segment:0);
                        $('#prev-page img').css('visibility',(i >= 0)?'visible':'hidden');
                        $('#next-page img').attr('id',(beginBlock+1 <len ) ? begin+1 : 0);
                        $('#next-page img').css('visibility',(beginBlock+1<len)?'visible':'hidden');   
                        back=true;
                    }                    
                }   
            }
        },
        
        displayOnglets: function(trls){
         
            var N = trls.length;
            var lineWidth = $("#right-page").width()-100;
            
            $('span#more').css('visibility','hidden');
            $('.onglets li').css('z-index',-100);
            $('.onglets li').css('visibility','hidden'); 
            var totWidth = 0;
            var overlap = 0;
            var ongClass='onglet first';
            var i=1;
            for(i = 0;i==0 || (i<N && (totWidth<lineWidth));i++){
               // alert('tot: '+totWidth +', lineW: '+lineWidth);
                var id = trls[i].work.id;
                $('li#onglet-'+id).css('z-index',N-i);
                $('li#onglet-'+id).css('left',totWidth-overlap);
                $('li#onglet-'+id).attr('class',ongClass);
                $('li#onglet-'+id).css('visibility','visible');
                totWidth +=  $('li#onglet-'+id).outerWidth()-overlap;
                var overlap = 15;
                ongClass='onglet';
            }
            if(i<N){
                nextHiddenId = i;
                $('span#more').css('visibility','visible');
               // $('span#more').wrap('<a href="#tr'+trId+'" />');                
            }
            return nextHiddenId;//to be changed
        },
        
        
        
        translate: function(){
                
        }
            
    }; 
      
        
    var tout = false;
    var otime = new Date(10, 10, 2010, 10,10,10);
    var dt = 100; 
    var trId = '';
    var begin = 0;// segment from which to begin the text's display - it can represent the first or the last segment (page-turn backward or forward)
    var back = false;
    var work;
    var ajaxData;
    var translations;
    var nextHiddenId=null;    
    var id_str = document.location.pathname.match(/\/id\/\d+/);
    var url = tdxio.baseUrl+"/work/ajaxread"+id_str;
    var hash = document.location.hash.substr(1);
    var qtity=50;
    var params;  
    var minHeight = 400;
   // var nextSegment;
   // var prevSegment;
    
    function resizeDT() {
        if (new Date() - otime < dt) {
            setTimeout(resizeDT, dt);
        } else {
            tout = false;
            tdxio.page.displayWork(ajaxData,trId,back);//refresh arrows
            tdxio.page.resize();
            tdxio.page.displayOnglets(translations);
        }                
    };
    
    $(document).ready(function() {
                
        if((hash==null)||(hash=='')||(hash==false)){
            params={'qtity':qtity};
        }else if(hash.match(/tr\d+/gi)!=null){
            trId = hash.match(/tr\d+/gi)[0].substr(2);
            beginHash = hash.match(/#beg\d+/gi);
            if((beginHash!=null)&&(beginHash!='')){begin = beginHash[0].substr(4);}
            params={'qtity':qtity,'trId':trId};
        }
        
        $.ajax({
            type:"get",
            url:encodeURI(url),
            dataType: "json",
            data: params,
            success: function(data){
                if(data.work.Interpretations.length>0){
                    var exists=false;
                    for(var k=0;k<data.work.Interpretations.length;k++){
                        if(trId == data.work.Interpretations[k].work.id){
                            exists = true;
                            break;
                        }
                    }
                    trId = (exists)?trId:data.work.Interpretations[0].work.id;
                    document.location.hash='tr'+trId;
                    //trId = (trId=='')?data.work.Interpretations[0].work.id:trId;
                    translations = tdxio.array.trShift(data.work.Interpretations.slice(),trId,true);
                    tdxio.page.displayOnglets(translations);
                }
                work = data.work;
                ajaxData = data;
                tdxio.page.displayWork(data,trId,false);
                tdxio.page.resize();
            },
            error: function() {
                alert("error reading the workk");
            }
        }); 
        

        
        $(window).bind('resize',(function() {
            otime = new Date();
            if (tout === false) {
                tout = true;
                setTimeout(resizeDT, dt);
            }
        }));
        
        $(".turn-page").bind("click",function() {
            tdxio.page.turn($(this).parents('div').attr('id'),this.id);
        });
       
        $('#text').empty();
        
        $('div#create').click(function(){
            alert('Create translation');
        });
        
        $('ul.onglets li').live('click',function(){
            var newId = this.id.split("-")[1];
            trId = newId;
            translations = tdxio.array.trShift(work.Interpretations.slice(),newId,true);
           /* nextHiddenId = tdxio.page.displayOnglets(translations);    */
           // alert('nId'+newId);
            //alert(ajaxData.work.Interpretations.length);
            nextHiddenId = tdxio.page.displayOnglets(translations);
            tdxio.page.displayWork(ajaxData,newId,back);
            tdxio.page.resize();
        });
        
        $('span#more').click(function(){
            alert(nextHiddenId);
            if(nextHiddenId!=null)
                translations = tdxio.array.trShift(data.work.Interpretations.slice(),nextHiddenId,false);
                nextHiddenId = tdxio.page.displayOnglets(translations);
        });
        
    });
    
    

})(jQuery);
