/**
 * Created by Administrator on 2018/1/21/0021.
 */

/**
 *
 * @param {type} data BASE64������
 * @param {type} key ������Կ
 * @param {type} iv ����
 * @returns {undefined}
 */

function updateTokenTime(phone){
    var url = "http://"+window.location.host+"/smarthome/index.php/Main/updateTokenTime";
    $.ajaxUtil(url,'post',{phone:phone},
        function(data){
            count=0;
            console.log("count");
        },function(error){
            console.log(error);
        });
}

function filterMessage(data){
    var result =  JSON.parse(data);
    if(result.cmd=='add_friend'){
        window.localStorage.user_badger=1;
        if(result.type==='gateway'){
            $.ajax({
                url : 'http://'+window.location.host+'/smarthome/index.php/Main/addsubscript',
                type : "POST",
                dataType : "text",
                data : {
                    type: "friend"
                },
                success : function(data){
                    console.log(data);
                },
                error : function(error){
                    console.log(error);
                }
            });

            var imgUrl = getRootPath()+"/application/views/plugin/app/images/icon_snj_02.png";
            var content ='<div class="bangd_main_img"><img src='+imgUrl+'></div>';
            $.bindDialog('�����ڻ������',content,'����','ͬ���',function(){
                $('#myroom_item').find('.myroom_info').remove();
                $('#myroom_item').append('<em class="myroom_info" ></em>');
                userBadger();
                $.closeDialog();
            },function(){
                window.location.href='http://'+window.location.host+'/smarthome/index.php/Main/myroom';
            });
        }

        if(result.type==='village'){
            $.ajax({
                url : 'http://'+window.location.host+'/smarthome/index.php/Main/addsubscript',
                type : "POST",
                dataType : "text",
                data : {
                    type: "village"
                },
                success : function(data){
                    console.log(data);
                },
                error : function(error){
                    console.log(error);
                }
            });
            $('#community_item').find('.myroom_info').remove();
            $('#community_item').append('<em class="myroom_info" ></em>');
            userBadger();
        }



    }
    if(result.result=='someone_login'){

        $.tooltip('���ʺ��������ط���¼',5000,true,function(){
            window.location.href='http://'+window.location.host+'/smarthome/index.php/Login/repeatLogin';
        });
    }

    if(result.result=='token_error')
    {
        window.location.href='http://'+window.location.host+'/smarthome/index.php/Login';
        return;
    }


   // //����
   // disarm(result);
   ////�л�ģʽ
   // switchMode(result);
   // //��ȡ��ǰģʽ
   // currentStatus(result);
   //
   // //sendMsg
   // sendMsg(result);


    if(result.cmd===""){
        $('.redspan2').show();
    }
    if(result.data!=null||result.data!=undefined){
        controlDevice(result.data);
    }

    if(result.result=='recv_timeout'){
        count++;
    }

    if(count==20)
    {
        updateTokenTime(window.localStorage['user']);
        // village();

    }
    getMsg();
}

function aesDecrypt(data, keyStr) {
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    //���ܵ��ǻ���BASE64�����ݣ��˴�data��BASE64����
    var decrypted = CryptoJS.AES.decrypt(data, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding});
    return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * ��������
 * @param {type} data �����ܵ��ַ���
 * @param {type} keyStr ��Կ
 * @param {type} ivStr ����
 * @returns {unresolved} ���ܺ������
 */
function aesEncrypt(data, keyStr) {
    var sendData = CryptoJS.enc.Utf8.parse(data);
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var encrypted = CryptoJS.AES.encrypt(sendData, key,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.ZeroPadding});
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

function getMsg(){
    console.log("http://server.atsmartlife.com/getmsg");
    var token=window.localStorage["text"];
    var aesKey=window.localStorage["debug"];
    var url="http://server.atsmartlife.com/getmsg?token="+token;
    console.log(token);
    console.log(aesKey);
    console.log(url);
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
                console.log("aes");
                var result = aesDecrypt(data,aesKey);
                console.log(result);
                filterMessage(result);
            }catch (error){
                //if(error.message==='Malformed UTF-8 data'){
                //    window.location.href='http://'+window.location.host+'/smarthome/index.php/Main';
                //}
                //setTimeout(obj.getMsg,3000);
                console.log("error");
            }

        },
        error : function(error){
            console.log('request error');
            //window.location.href='http://'+window.location.host+'/smarthome/index.php/Login';
            //setTimeout(obj.getMsg,3000);
            //$.console.log(error);
        }
    });
}


//ͬ����� village
function village(){
    var url ='http://'+window.location.host+'/smarthome/index.php/Main/respondaddfriend';
    $.ajaxUtil(url,'get', function (data) {
        $.console.log(data);
    }, function (error) {
        $.console.log(error)
    });
}

//�����豸
function controlDevice(data){
    if(data.dev_class_type=="light")
        light(data);

    if(data.dev_class_type=='dimmer')
        lighting(data);

    if(data.dev_class_type=='curtain');
        curtain(data);

}

//����send_msg
function sendMsg(data){
    if((data.msg==undefined||data.msg=='')||(data.cmd==undefined||data.cmd=='')) return;
    if(data.subject!==undefined&&data.subject=='community'){
        reviceMsg(data); return;
    }
    var msg = JSON.parse(data.msg);
    if(msg.result!=undefined&&msg.result=='zigbee_gw_not_line') {
        $.tooltip('Э����������',3000,true); return;
    }
    contrDeviceSM(msg);
    //��������
    if(devicetype=='zigbee_coordin')
    {

        disarmScenZigbee(msg);
    }
    else
    {
        disarmScen(msg);
    }

}



//���ɵ���
function light(data){
    var id = data.room_name+","+data.device_name;
    //  alert(id);
    if(data.dev_state==undefined) return;

    if(data.dev_state.power==="on"){
        $("div[deviceid='"+id+"']").find('a').removeClass().addClass('switch_on');
        $("div[deviceid='"+id+"']").find('.light_state').text('�ѿ���');

    }
    if(data.dev_state.power==="off"){
        $("div[deviceid='"+id+"']").find('a').removeClass().addClass('switch_off');
        $("div[deviceid='"+id+"']").find('.light_state').text('�ѹر�');


    }

}

//sendMsg���ɵ����
function lightSM(data){
    var id = data.room_name+","+data.device_name;
    if(data.func_command==undefined) return;

    if(data.func_command==="on"){
        $("div[deviceid='"+id+"']").find('a').removeClass().addClass('switch_on');
        $("div[deviceid='"+id+"']").find('.light_state').text('�ѿ���');

    }
    if(data.func_command==="off"){
        $("div[deviceid='"+id+"']").find('a').removeClass().addClass('switch_off');
        $("div[deviceid='"+id+"']").find('.light_state').text('�ѹر�');


    }

}

//�ɵ���
function lighting(data){
    var id = data.room_name+","+data.device_name;
    var obj =   $("div[deviceid='"+id+"']");
    if(data.dev_state==undefined) return;

    if(data.dev_state.power==="on"){
        $(obj).find('.light2_control').find('a').removeClass().addClass('switch_on');
        $(obj).find('.light2_state').text('�ѿ���');

        //����
        $('.switch_box').find('a').removeClass().addClass('shebei_c_btn');
        $('.air_zt').html('�ѿ���');
    }

    if(data.dev_state.power==="off"){
        $(obj).find('.light2_control').find('a').removeClass().addClass('switch_off');
        $(obj).find('.light2_state').text('�ѹر�');

        //����
        $('.light').find('a').removeClass().addClass('shebei_c_btn_off');
        $('.light').find('.air_zt').html('�ѹر�');
    }
    $(obj).find('.b_c em').text(data.dev_state.value);


}

function lightingSM(data){
    var id = data.room_name+","+data.device_name;
    var obj =   $("div[deviceid='"+id+"']");
    if(data.func_command==undefined) return;

    if(data.func_command==="on"){
        $(obj).find('.light2_control').find('a').removeClass().addClass('switch_on');
        $(obj).find('.light2_state').text('�ѿ���');

        //����
        $('.switch_box').find('a').removeClass().addClass('shebei_c_btn');
        $('.air_zt').html('�ѿ���');
    }

    if(data.func_command==="off"){
        $(obj).find('.light2_control').find('a').removeClass().addClass('switch_off');
        $(obj).find('.light2_state').text('�ѹر�');

        //����
        $('.light').find('a').removeClass().addClass('shebei_c_btn_off');
        $('.light').find('.air_zt').html('�ѹر�');
    }
    $(obj).find('.b_c em').text(data.func_value.value);
}

//����
function curtain(data){

    var id = data.room_name+","+data.device_name;

    if(data.dev_state==undefined) return;

    if(data.dev_state.power==="open"){
        $("div[deviceid='"+id+"']").find('.gray').text('����');
        $("div[deviceid='"+id+"']").find('.jindutiao li a').removeClass('on');
        $("div[deviceid='"+id+"']").find('.jindutiao_r a').addClass('on');
    }

    if(data.dev_state.power==="stop"){
        $("div[deviceid='"+id+"']").find('.gray').text('��ͣ');
        $("div[deviceid='"+id+"']").find('.jindutiao li a').removeClass('on');
        $("div[deviceid='"+id+"']").find('.jindutiao_l_a a').addClass('on');
    }

    if(data.dev_state.power==="close"){
        $("div[deviceid='"+id+"']").find('.gray').text('�ش�');
        $("div[deviceid='"+id+"']").find('.jindutiao li a').removeClass('on');
        $("div[deviceid='"+id+"']").find('.jindutiao_l a').addClass('on');
    }


}

function ourtainSM(data){
    var id = data.room_name+","+data.device_name;

    if(data.func_command==undefined) return;

    if(data.func_command==="open"){
        $("div[deviceid='"+id+"']").find('.gray').text('����');
        $("div[deviceid='"+id+"']").find('.jindutiao li a').removeClass('on');
        $("div[deviceid='"+id+"']").find('.jindutiao_r a').addClass('on');
    }

    if(data.func_command==="stop"){
        $("div[deviceid='"+id+"']").find('.gray').text('��ͣ');
        $("div[deviceid='"+id+"']").find('.jindutiao li a').removeClass('on');
        $("div[deviceid='"+id+"']").find('.jindutiao_l_a a').addClass('on');
    }

    if(data.func_command==="close"){
        $("div[deviceid='"+id+"']").find('.gray').text('�ش�');
        $("div[deviceid='"+id+"']").find('.jindutiao li a').removeClass('on');
        $("div[deviceid='"+id+"']").find('.jindutiao_l a').addClass('on');
    }
}
