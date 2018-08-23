$(function() {
    // 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
    oTab = null,
        oTabA = null,
        oTabU = null,
        oTabC = null;
    var role = $.cookie("perm");
    var account = $.cookie("username");
    // var role = storage.read("role"), account = storage.read("username");
    $("#account").html(account);
    $("." + role).remove();
    // 去除display:none样式,显示菜单
    $(".sidebar-menu").show();
    // sidebar 菜单点击事件
    $(".sidebar-menu").on("click", "a", function() {
        typeof pageChange === "function" && pageChange();
        var html = $(this).data("html");
        var js = $(this).data("js");
        if (html) {
            $(".content").load("pages/" + html + ".html", function() {
                if (js) {
                    $.ajax({
                        type: "GET",
                        dataType: "script",
                        cache: true,
                        url: "pages/" + js + ".js",
                        complete: function() {
                            $("body .modal").on("hidden.bs.modal", function() {
                                $(".has-error", this).removeClass("has-error");
                                $(".modal-footer .tip", this).html("");
                            });

                        }
                    });
                }
            });
            //菜单高亮
            $(this)
                .parent()
                .addClass("active")
                .siblings()
                .removeClass("active")
                .find("ul")
                .slideUp();
        }
    });

    $("body").on("keydown", "#jumptopage input", function(event) {
        if (event.keyCode == "13") {
            var oTabObj = [oTab, oTabA, oTabU, oTabC][Number($(this).attr("data-otab") || 0)];

            if (oTabObj) {
                if (
                    Number($(this).val()) >
                    Math.ceil(
                        Number(oTabObj.api().ajax.json().recordsFiltered) /
                        oTabObj.api().ajax.params().length
                    ) ||
                    Number($(this).val()) < 1
                ) {
                    createModalTips("所输入跳页页码有误！");
                } else {
                    oTabObj.fnSettings().ajax.data.start =
                        (Number($(this).val()) - 1) *
                        oTabObj.api().ajax.params().length
                    dtReloadData(oTabObj, false);
                }
            } else {
                createModalTips("表格数据未初始化！");
            }
        }
    });

    function loadPage() {
        //页面刷新时根据hash加载对应的页面
        var hash = window.location.hash;
        var $history = $("[href='" + hash + "']");
        if (hash != "" && $history.length == 1) {
            //$history类类数组
            if (!$history.closest("ul").hasClass("sidebar-menu")) {
                $(".treeview-menu")
                    .css("display", "none")
                    .removeClass("menu-open");
                $history
                    .closest("ul")
                    .css("display", "block")
                    .addClass("menu-open")
                    .parent("li")
                    .addClass("active")
                    .siblings()
                    .removeClass("active");
                // $history.closest('ul').addClass('active');
            }
            $history.click();
        } else {
            $firstPage = $(".sidebar-menu .treeview:first");
            if ($firstPage.find("ul").length == 1) {
                $firstPage
                    .find("ul")
                    .slideDown(0)
                    .addClass("menu-open");
                $firstPage
                    .find("ul")
                    .addClass("active")
                    .find("li:first > a")
                    .click();
            } else {
                $firstPage.find("a").click();
            }
        }
    }

    loadPage();

    /*设置提示模态框点击遮罩层不隐藏*/
    $("#modal_tips").modal({
        backdrop: "static",
        show: false
    });
    // 注销弹出模态框 提示
    $(".js-logout").click(function() {
        createModalTips("确定退出后台管理系统?", "logout");
    });
});

function clearCookies() {
    $.cookie("token", "", { expires: -1, path: "/" });
    $.cookie("uuid", "", { expires: -1, path: "/" });
    $.cookie("username", "", { expires: -1, path: "/" });
    $.cookie("role", "", { expires: -1, path: "/" });
}
// 登出
function logout() {
    $.ajax({
        type: "post",
        dataType: "json",
        url: "/crmusers/logout",
        complete: function(d) {
            clearCookies();
            window.location.href = "index.html";
        }
    });
}

verifyEventsInit();

//修改密码
function changePwd() {
    $("#modal_change_pwd")
        .modal("show")
        .find("input")
        .val("");
}

//确认提交
$("#changePwd").on("click", function() {
    if (!verification($("#modal_change_pwd"))) return;
    var password = $("#top_password").val();
    var passworda = $("#passworda").val();
    var obj = {
        oldpassword: password,
        password: passworda,
        uuid: $.cookie("uuid")
    };
    console.log(obj);

    if (obj) {
        $.ajax({
            url: "/crmusers/password",
            data: obj,
            type: "put",
            dataType: "json",
            success: function(d) {
                $("#modal_change_pwd")
                    .modal("hide")
                    .find("input")
                    .val("");
                createModalTips(d.msg || "密码修改成功！");
                logout();
            },
            error: cgiDtError
        });
    }
});