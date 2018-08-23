verifyEventsInit();




var oTab = createDt();
var nodeEdit;

var opr;

//根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie("perm");

$("#" + role).remove();
var token = $.cookie("token");


function createDt() {
    return $("#tableLi").dataTable({
        serverSide: true,
        searching: false,
        ordering: false,
        responsive: true,
        bLengthChange: true,
        lengthMenu: [
            [10, 15, 50, 100],
            [10, 15, 50, 100]
        ],
        // drawCallback: function() {
        //     this.api().column(0).nodes().each(function(cell, i) { cell.innerHTML = ++i; });
        // },
        language: {
            url: "js/lib/dataTables.chinese.json"
        },
        ajax: {
            url: "/crmwxusers",
            type: "GET",
            dataSrc: (d) => { return d.wxusers },
            error: cgiDtError
        },
        columns: [{
            data: "wxname"
        }, {
            data: "headurl",
            render: (d) => {
                return '<img class="headerImg" src="' + d + '" alt="">';
            }
        }, {
            data: "storename"
        }, {
            data: "storelogo",
            render: (d) => {
                return '<img class="headerImg" src="' + imgUrl + d + '" alt="">';
            }
        }, {
            data: "created"
        }, {
            data: "uuid",
            render: (d, t, r) => {
                if ((role == "root")) { //|| r.perm != "root"
                    return (r.deleted == 0) ? '<span class=" fa fa-2x fa-toggle-on " title="禁用用户" onclick="editData(this)" style="display: inline-block;color: #30d260;transition:0.7s;"></span>' :
                        '<span class=" fa fa-2x fa-toggle-off " title="解禁用户" onclick="editData(this)" style="display: inline-block;color: #bababa;transition:0.7s;"></span>';
                } else {
                    return ["启用", "禁用"][r.deleted];
                }
            }
        }],
        "drawCallback": function() {
            $("body > div.tooltip").remove();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

function openAdd() {
    $(".form-horizontal").resetForm();

    $(".num").show()
    $(".checkType2").show()
    $(".checkType1").hide()

    opr = "add";
    $("#inspect").attr("disabled", false);
    $("#modalAdd").modal("show");
    $("#myModalLabel").text("新增分类");
    $("#modalAdd").find(".form-group i").attr("class", "fa fa-exclamation-circle");
}

function editData(that, i) {

    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
    $.ajax({
        url: "/crmwxusers",
        data: {
            uuid: nodeEdit.uuid
        },
        type: 'put',
        success: function(data) {
            if (data) {
                createModalTips(nodeEdit.deleted == 0 ? '成功禁用该用户！' : "成功解禁该用户！");
                oTab.api().ajax.reload(null, false);
            }
        },
        error: cgiDtError
    })


}

function saveUser() {
    if (!verification()) return;

    var typeContent;
    if ($("#inspect option:selected").val() == '例行检查') {
        typeContent = $("#type option:selected").val()

    } else {

        typeContent = $("#type2").val()

    }
    var parm = {
        inspectname: $("#inspect option:selected").val(),
        type: typeContent,
        item: $("#item").val(),
        standard: $("#standard").val(),
        score: $("#score").val(),
        num: $("#num").val()
    };
    console.log(parm)
    if (opr == "add") {
        /*$.ajax({
            url: cgiDtUrl("/user/addInspectItem"),
            data: parm,
            type: 'post',
            success: function (data) {
                if (data) {
                    createModalTips(data.msg || '添加成功！');
                    $("#modalAdd").modal("hide");
                    oTab.api().ajax.reload(null, false);
                }
            },
            error: cgiDtError
        })*/
    } else if (opr == "edit") {
        parm.uuid = nodeEdit.uuid
            /*$.ajax({
                url: cgiDtUrl("/user/updateInspectItem"),
                data: parm,
                type: 'put',
                success: function (data) {
                    if (data) {
                        createModalTips(data.msg || '修改信息成功！');
                        $("#modalAdd").modal("hide");
                        oTab.api().ajax.reload(null, false);
                    }
                },
                error: cgiDtError
            })*/
    }
}


function deleteData(that) {
    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
    createModalTips("确定要删除该检查项？", "confirmDeleteData");
}

function confirmDeleteData() {
    console.log(nodeEdit)
        /*$.ajax({
            url: cgiDtUrl("/user/deleteInspectItem"),
            data: {
                uuid: nodeEdit.uuid
            },
            type: "delete",
            success: function (data) {
                createModalTips(data.msg || '删除成功！');
                oTab.api().ajax.reload(null, false);
                $("#modal_tips").modal("hide");
            }
        });*/
}

function checkTypeChange() {
    if ($("#inspect option:selected").val() == '例行检查') {
        $(".num").hide()
        $(".checkType2").hide()
        $(".checkType1").show()
    } else {
        $(".num").show()
        $(".checkType2").show()
        $(".checkType1").hide()
    }
}