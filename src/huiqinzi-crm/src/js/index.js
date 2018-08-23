var timer = ''
    /*设置提示模态框点击遮罩层不隐藏*/
$("#modal_tips,#modal_forgot").modal({
    "backdrop": "static",
    "show": false
});

verifyEventsInit();
// 登录
function OnSubmit() {
    // window.location.href = 'main.html';
    if (!verification()) return;
    var username = $.trim($("#username").val()),
        password = $.trim($("#password").val()),
        obj = {
            username: username,
            password: password
        };

    if (username && password) {
        $.ajax({
            url: "/crmusers/login",
            data: obj,
            type: "post",
            dataType: 'json',
            success: function(data) {
                $.cookie('uuid', data.uuid);
                $.cookie('token', data.token);
                $.cookie('username', data.username);
                $.cookie('perm', data.perm);
                $.cookie('key', data.key);
                // storage.write("uuid", data.uuid);
                // storage.write('token', d.token);
                // storage.write('username', d.username);
                // storage.write('role', d.role);
                window.location.href = 'main.html';
            }
        });
    } else {
        createModalTips('帐号密码不能为空');
    }
}

// 回车键触发登录
document.onkeydown = function(event) {
    if ($("body .modal-backdrop").length === 0 && event.keyCode === 13) {
        $('.submit').trigger('click');
    }
}

// 找回密码
function FindPswd() {
    $("#modal_forgot").modal({ "show": true }).find('input').val('');
    restMessage(timer)
}

//确认提交
$("#submitF").on("click", function() {
    if (!verification($("#modal_forgot"))) return;

    var username = $.trim($("#username1").val());
    var code = $.trim($("#code").val());
    var password = $.trim($("#password1").val())
    var obj = {
        "username": username,
        "password": password,
        "code": code
    }
    if (obj) {
        $.ajax({
            url: cgiDtUrl("/crmusers/findpassword"),
            data: obj,
            type: "POST",
            success: function(d) {
                $('#modal_forgot').modal("hide");
                createModalTips("密码重置成功！");
            },
            error: cgiDtError
        });
    }

})

//发送验证
function restMessage(timer) {
    $("#basic-addon2").html('获取验证码')
    $("#basic-addon2").attr('disabled', false);
    clearInterval(timer);
}

function SendMessage() {
    if (!verification($("#user_phone"))) return;
    var username = $.trim($("#username1").val()),
        obj = {};
    var obj = { username: username }
    var ii = 60;

    $("#basic-addon2").html(ii).attr('disabled', true);

    clearInterval(timer);
    timer = setInterval(function() {
        var code = $.trim($("#code").val());
        $("#basic-addon2").html(--ii);
        if (ii <= 0) {
            restMessage(timer)
        } else if (ii > 0) {
            $("#basic-addon2").html(ii).attr('disabled', true);
        }
    }, 1000);

    if (username) {
        $.ajax({
            url: cgiDtUrl("/crmusers/getcode"),
            data: obj,
            type: "POST",
            success: function(d) {
                createModalTips("发送成功！");
            },
            error: function() {
                restMessage(timer)
            }
        });
    } else {
        createModalTips('帐号不能为空');
    }
}

$("body .modal").on("hidden.bs.modal", function() {
    $(".has-error", this).removeClass("has-error");
    $(".modal-footer .tip", this).html("");
})