/**
 * Created by Administrator on 2018/1/22.
 */

var getMsgUtil=(function(callback){

    var obj = new Object();
    obj.aesKey =  window.localStorage["debug"];
    obj.count = 0;
    obj.baseurl='http://'+window.location.host+'/static/';

    /**
     *
     * @param {type} data BASE64������
     * @param {type} key ������Կ
     * @param {type} iv ����
     * @returns {undefined}
     */
     obj.aesDecrypt = function(data, keyStr) {
        var key = CryptoJS.enc.Utf8.parse(keyStr);
        //���ܵ��ǻ���BASE64�����ݣ��˴�data��BASE64����
        var decrypted = CryptoJS.AES.decrypt(data, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding});
        return decrypted.toString(CryptoJS.enc.Utf8);
    };

    /**
     * ��������
     * @param {type} data �����ܵ��ַ���
     * @param {type} keyStr ��Կ
     * @param {type} ivStr ����
     * @returns {unresolved} ���ܺ������
     */
     obj.aesEncrypt = function(data, keyStr) {
        var sendData = CryptoJS.enc.Utf8.parse(data);
        var key = CryptoJS.enc.Utf8.parse(keyStr);
        var encrypted = CryptoJS.AES.encrypt(sendData, key,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.ZeroPadding});
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    };


    obj.updateTokenTime = function(phone){
        console.log("updataTokenTime");
        $.ajax({
                url : 'http://'+window.location.host+'/smarthome/update/token',
                type : "POST",
                dataType:'json',
                data : {
                    "username":phone
                },
                success : function(data){
                    obj.count=0;
                    console.log(data);
                    var errors = data["errors"];
                    if(errors.length==0){
                        window.localStorage["text"]=data["token"];
                    }
                    else{
                        alert(errors);
                    }
                },
                error : function(error){
                    console.log(error);
                }
            });
    };
    obj.updateAeskey=function(){
        $.ajax({
                url : 'http://'+window.location.host+'/smarthome/update/aeskey',
                type : "POST",
                dataType:'json',
                success : function(data){
                    console.log(data);
                    window.localStorage["debug"]=data["aeskey"];
                    console.log("aeskey:"+window.localStorage["debug"]);
                },
                error : function(error){
                    console.log(error);
                }
            });
    }

    obj.message = function(result){
            var data  = {};
            data.from_username=result.from_username;
            data.data=result.msg.data;
            console.log("message");
            //var url ='http://'+window.location.host+'/smarthome/index.php/Main/message';
            //
            //$.ajaxUtil(url, 'post',{data:data}, function (data) {
            //    console.log(data);
            //}, function (error) {
            //    console.log(error)
            //});
    }

    obj.light=function(data){
        var id = data.room_name+","+data.device_name;
        //  alert(id);
        if(data.dev_state==undefined) {
            return;
        }
        console.log(data.dev_state);
        if(data.dev_state.power==="on"){
            console.log("light on");
            $("div[deviceid='"+id+"']").find('a').removeClass().addClass('switch_on');
            $("div[deviceid='"+id+"']").find('.light_state').text('�ѿ���');
            $("div[deviceid='"+id+"']").find('.img_light_state').find("img").attr("src",obj.baseurl+'blog/img/smarthome/shebei_light_on.png');


        }
        if(data.dev_state.power==="off"){
            console.log("light off");
            $("div[deviceid='"+id+"']").find('a').removeClass().addClass('switch_off');
            $("div[deviceid='"+id+"']").find('.light_state').text('�ѹر�');
            $("div[deviceid='"+id+"']").find('.img_light_state').find("img").attr("src",obj.baseurl+'blog/img/smarthome/shebei_light_off.png');

        }

    }

    obj.curtain=function(data){
        var id = data.room_name+","+data.device_name;
        if(data.dev_state==undefined) {
            return;
        }
        if(data.dev_state.power==="open"){
            $("div[deviceid='"+id+"']").find('.curtain_state').text('����');
            var d=$("div[deviceid='"+id+"']").find('a');
            $(d[0]).removeClass("curtain_open_n").addClass("curtain_open_c");
            $(d[1]).removeClass("curtain_stop_c").addClass("curtain_stop_n");
            $(d[2]).removeClass("curtain_close_c").addClass("curtain_close_n");

        }

        if(data.dev_state.power==="stop"){
             $("div[deviceid='"+id+"']").find('.curtain_state').text('��ͣ');
             var d=$("div[deviceid='"+id+"']").find('a');
             $(d[0]).removeClass("curtain_open_c").addClass("curtain_open_n");
             $(d[1]).removeClass("curtain_stop_n").addClass("curtain_stop_c");
             $(d[2]).removeClass("curtain_close_c").addClass("curtain_close_n");

        }

        if(data.dev_state.power==="close"){
             $("div[deviceid='"+id+"']").find('.curtain_state').text('�ش�');
             var d=$("div[deviceid='"+id+"']").find('a');
             $(d[0]).removeClass("curtain_open_c").addClass("curtain_open_n");
             $(d[1]).removeClass("curtain_stop_c").addClass("curtain_stop_n");
             $(d[2]).removeClass("curtain_close_n").addClass("curtain_close_c");

        }
    }

    obj.sceneCanvasDraw=function(canvas_obj,t){
        //alert("���");
			var canvas=canvas_obj,
			//var canvas = document.getElementById('canvas'),  //��ȡcanvasԪ��
				context = canvas.getContext('2d'),  //��ȡ��ͼ������ָ��Ϊ2d
				centerX = canvas.width/2,   //Canvas���ĵ�x������
				centerY = canvas.height/2,  //Canvas���ĵ�y������
				rad = Math.PI*2/100, //��360�ȷֳ�100�ݣ���ôÿһ�ݾ���rad��
				speed = 0, //���صĿ����Ϳ�����
				time_s=1.8/t; //��������ʱ��
            var gradient=context.createLinearGradient(0,0,170,0);
			gradient.addColorStop("0","magenta");
			gradient.addColorStop("0.5","blue");
			gradient.addColorStop("0.8","red");

            var imgobj=new Image();
            imgobj.src=obj.baseurl+'blog/img/smarthome/scene_success.png';

			//����5���ؿ���˶���Ȧ
			function blueCircle(n){
				context.save();
				context.strokeStyle = gradient; //���������ʽ
				context.lineWidth = 5; //�����߿�
				context.beginPath(); //·����ʼ
				context.arc(centerX, centerY, 35 , -Math.PI/2, -Math.PI/2 +n*rad, false); //���ڻ���Բ��context.arc(x���꣬y���꣬�뾶����ʼ�Ƕȣ���ֹ�Ƕȣ�˳ʱ��/��ʱ��)
				context.stroke(); //����
				context.closePath(); //·������
				context.restore();
			}
			//���ư�ɫ��Ȧ
			function whiteCircle(){
				context.save();
				context.beginPath();
				context.lineWidth = 5; //�����߿�
				context.strokeStyle = "gray";
				context.arc(centerX, centerY, 35 , 0, Math.PI*2, false);
				context.stroke();
				context.closePath();
				context.restore();
			}
			//����ѭ��
			(function drawFrame(){
				if(speed<=100){
					window.requestAnimationFrame(drawFrame);
					context.clearRect(0, 0, canvas.width, canvas.height);
					whiteCircle();
					//text(speed);
					blueCircle(speed);
					speed+=time_s;
				}
				else{
				    context.clearRect(0, 0, canvas.width, canvas.height);
					//alert("ִ�гɹ�");
                    context.drawImage(imgobj,0,0,80,80);
                    setTimeout(function(){ context.clearRect(0, 0, canvas.width, canvas.height);}, 1000);//��ʱ1��
				}

			}());
    };
    obj.filterMessage = function (data){
        var result =  JSON.parse(data);
        if(result.cmd=='add_friend'){
            window.localStorage.user_badger=1;
            if(result.type==='gateway'){
                //$.ajax({
                //    url : 'http://'+window.location.host+'/smarthome/index.php/Main/addsubscript',
                //    type : "POST",
                //    dataType : "text",
                //    data : {
                //        type: "friend"
                //    },
                //    success : function(data){
                //        $.console.log(data);
                //    },
                //    error : function(error){
                //        $.console.log(error);
                //    }
                //});
                //
                //var imgUrl = getRootPath()+"/application/views/plugin/app/images/icon_snj_02.png";
                //var content ='<div class="bangd_main_img"><img src='+imgUrl+'></div>';
                //$.bindDialog('�����ڻ������',content,'����','ͬ���',function(){
                //    $('#myroom_item').find('.myroom_info').remove();
                //    $('#myroom_item').append('<em class="myroom_info" ></em>');
                //    $.closeDialog();
                //},function(){
                //    window.location.href='http://'+window.location.host+'/smarthome/index.php/Main/myroom';
                //});
                console.log("add_friend");
            }

            if(result.type==='village'){
                //$.ajax({
                //    url : 'http://'+window.location.host+'/smarthome/index.php/Main/addsubscript',
                //    type : "POST",
                //    dataType : "text",
                //    data : {
                //        type: "village"
                //    },
                //    success : function(data){
                //        $.console.log(data);
                //    },
                //    error : function(error){
                //        $.console.log(error);
                //    }
                //});
                console.log("village");
            }

        }

        if(result.cmd==="dev_report") { //��ȡ����״̬
            console.log("dev_report");
            if (result.data != undefined) {
                var data = result.data;
                console.log(data);
                if (data.dev_class_type === "light") {
                    obj.light(data);
                }
                if (data.dev_class_type === "curtain"){
                    obj.curtain(data);
                }
                if(data.msg_type==="security_mode_change"&&data.command==="up"){
                    var mode=data.security_mode;
                    switch (mode){
                        case "home":
                            $("#dropdownmenu_safety").find('img').attr("src",obj.baseurl+'blog/img/smarthome/safety_home.png');
                            break;
                        case "out":
                            $("#dropdownmenu_safety").find('img').attr("src",obj.baseurl+'blog/img/smarthome/safety_out.png');
                            break;
                        case "sleep":
                            $("#dropdownmenu_safety").find('img').attr("src",obj.baseurl+'blog/img/smarthome/safety_sleep.png');
                            break;
                        case "disarm":
                            var gesturepwd_window = document.getElementById('gesturepwd_window');
                            var over = document.getElementById('over');
                            gesturepwd_window.style.display = "none";
                            over.style.display = "none";
                            $("#dropdownmenu_safety").find('img').attr("src",obj.baseurl+'blog/img/smarthome/safety_disarm.png');
                            break;
                        default :
                            $("#dropdownmenu_safety").find('img').attr("src",obj.baseurl+'blog/img/smarthome/safety_home.png');
                    }
                }
            }
        }
        if(result.cmd==="send_msg"&&result.subject==="control") //��ȡ�豸�����䡢����
        {
            if (result.msg != undefined && result.msg != null) {
                var msg = JSON.parse(result.msg);
                if (msg.result === "success") {
                    if (msg.msg_type === "room_manager") {
                        if (msg.rooms != undefined && msg.rooms != null) {
                            var room_obj = {"rooms": msg.rooms};
                            window.localStorage["rooms"] = JSON.stringify(room_obj);
                            console.log(window.localStorage["rooms"]);
                        }
                    }
                    if (msg.msg_type === "combination_control_manager") {
                        if (msg.combs != undefined && msg.combs != null) {
                            var comb_obj = {"combs": msg.combs};
                            window.localStorage["combs"] = JSON.stringify(comb_obj);
                            console.log(window.localStorage["combs"]);
                        }
                        if(msg.command==="start"){
                           if(msg.duration!= undefined && msg.duration != null){
                               var speed=msg.duration;
                               var control_name=msg.control_name;
                               var array_by_name=document.getElementsByName(control_name);
                               for(var i=0;i<array_by_name.length;i++){
                                     if(array_by_name[i].getAttribute("class")==="a-img2"){
                                         var canvas_obj=array_by_name[i].firstChild;
                                         console.log(canvas_obj);
                                         console.log(speed);
                                         obj.sceneCanvasDraw(canvas_obj,speed);
                                     }
                               }
                           }
                        }

                    }
                    if (msg.msg_type === "device_manager") {
                        if (msg.devices != undefined && msg.devices != null) {
                            var device_obj = {"devices": msg.devices};
                            window.localStorage["devices"] = JSON.stringify(device_obj);
                            console.log(window.localStorage["devices"]);
                        }
                    }
                }
            }
        }

        if(result.result=='someone_login'){
            //$.tooltip('���ʺ��������ط���¼',5000,true,function(){
            //    window.location.href='http://'+window.location.host+'/smarthome/index.php/Login/repeatLogin';
            //});
            console.log("someone_login");
        }

        if(result.result=='token_error')
        {
            //window.location.href='http://'+window.location.host+'/smarthome/index.php/Login';
            console.log("token_error");
            obj.updateTokenTime(window.localStorage['user']);
            //return;
        }

        if(result.msg!=''&&result.msg!=undefined)
        {
            if(result.msg.type!=undefined&&result.msg.type==="message")
            {
                window.localStorage.community_badger = 1;
                obj.message(result);
                //$.ajax({
                //    url : 'http://'+window.location.host+'/smarthome/index.php/Main/addsubscript',
                //    type : "POST",
                //    dataType : "text",
                //    data : {
                //        type: "service",
                //        subtype: result.msg.data[0].messagetype
                //    },
                //    success : function(data){
                //        $.console.log(data);
                //    },
                //    error : function(error){
                //        $.console.log(error);
                //    }
                //});
                console.log("message2");
                obj.getMsg();return;
            }

        }


        if($.isFunction(callback)){
              callback(result);
        }

        if(result.result=='recv_timeout'){
            obj.count++;
        }

        if(obj.count==20)
        {
            obj.updateTokenTime(window.localStorage['user']);
            // village();
        }
        obj.getMsg();
    };

    obj.getMsg = function(){
        console.log("http://server.atsmartlife.com/getmsg");
        var token=window.localStorage["text"];
        var aesKey=window.localStorage["debug"];
        var url="http://server.atsmartlife.com/getmsg?token="+token;
        //console.log(token);
        console.log(aesKey);
        //console.log(url);
        $.ajax({
            url : url,
            type : "get",
            dataType : "text",
            success : function(data){
                try{
                    if(data==''||data==undefined)
                    {
                        return ;
                    }
                    var result = obj.aesDecrypt(data,aesKey);
                    //console.log(result);
                    obj.filterMessage(result);
                }catch (error){
                    if(error.message==='Malformed UTF-8 data'){
                        obj.updateAeskey();
                    }
                    //obj.getMsg();
                    setTimeout(obj.getMsg,3000);
                    console.log(error);
                }

            },
            error : function(error){
                console.log('request error');
                //window.location.href='http://'+window.location.host+'/smarthome/index.php/Login';
                setTimeout(obj.getMsg,3000);
                //obj.getMsg();
                console.log(error);
            }
        });
    };

    obj.getMsg();

})();