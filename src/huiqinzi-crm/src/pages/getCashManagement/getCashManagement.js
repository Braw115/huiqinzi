verifyEventsInit();
//活动时间
$('.form_datetime').datetimepicker({
    weekStart: 0, //一周从哪一天开始
    todayBtn: 1, //
    autoclose: true,
    todayHighlight: 1,
    language: 'zh-CN',
    startView: 0,
    forceParse: 0,
    showMeridian: 1
});
$.ajax({
    url: "/crmlogistics/shipper",
    type: 'get',
    success: function(data) {
        data.map((e, i) => {
            $("#logisticscode").append($('<option value="' + e.shippercode + '">' + e.shippername + '</option>'));
        });

    },
    error: cgiDtError
})



$("#state").on("change", function() {
    oTab.fnSettings().ajax.data.start = 0;
    oTab.fnSettings().ajax.data.state = $("#state").val();
    dtReloadData(oTab, false);
});

$("#code").on("keypress", function(event) {
    if (event.keyCode == 13) {
        oTab.fnSettings().ajax.data.start = 0;
        oTab.fnSettings().ajax.data.code = $("#code").val();
        dtReloadData(oTab, false);
    }
});

var oTab = createDt(),
    nodeEdit;
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
            url: "/crmwithdraw",
            type: "GET",
            data: { state: $("#state").val() },
            dataSrc: (d) => {
                return d.withdraw;
            },
            error: cgiDtError
        },
        columns: [{
                data: "amount"
            },
            {
                data: "created",
                render: function(d) {
                    return d ? new Date(d).format("yyyy-MM-dd hh:mm:ss") : "";
                }
            },
            {
                data: "state"
            },
            {
                data: "uuid",
                render: function(d, t, r) {
                    if (r.state == "待受理") {
                        return '<div class="btn-group btn-group-sm" style="min-width:100px;">' +
                            '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="onGetCash(this)"  title="审核提现"><i class="fa fa-pencil"></i></a>' +

                            // '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="delGetCash(this,1)"  title="受理"><i class="fa fa-pencil"></i></a>' +
                            // '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="delGetCash(this,0)"  title="拒绝"><i class="fa fa-pencil"></i></a>' +
                            '</div>';
                    } else {
                        return "";
                    }
                }
            }
        ],
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
    $("#myModalLabel").text("新增团购商品");
    $("#modalAdd").find(".form-group i").attr("class", "fa fa-exclamation-circle");
}

function delGetCash(that, i) {

    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
    $.ajax({
        url: "/crmwithdraw",
        data: {
            uuid: nodeEdit.uuid,
            state: i == 1 ? "accepted" : "refused"
        },
        type: 'put',
        success: function(data) {
            if (data) {
                createModalTips(data.msg || i == 1 ? '提现成功受理！' : "提现已拒绝！");
                oTab.api().ajax.reload(null, false);
            }
        },
        error: cgiDtError
    })
}

function onGetCash(that) {
    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
    $.ajax({
        url: "/crmwxusers/get",
        data: {
            useruuid: nodeEdit.useruuid
        },
        type: 'get',
        success: function(data) {
            $("#modalAdd_cash #amount").val(nodeEdit.amount);
            $("#modalAdd_cash #balance").val(data.balance);
            $("#modalAdd_cash ").modal("show");
        },
        error: cgiDtError
    })
}

function doGetCash() {

    $.ajax({
        url: "/crmwithdraw",
        data: {
            uuid: nodeEdit.uuid,
            state: $("input[name=cashState]").val()
        },
        type: 'put',
        success: function(data) {
            if (data) {
                $("#modalAdd_cash ").modal("hide");
                createModalTips(data.msg || $("input[name=cashState]").val() == "accepted" ? '提现成功受理！' : "提现已拒绝！");
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

function cashData(that) {
    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
    createModalTips("确定要删除该检查项？", "confirmCashData");
}

function confirmCashData() {
    $.ajax({
        url: "/crmorders/consume",
        data: {
            uuid: nodeEdit.uuid
        },
        type: "put",
        success: function(data) {
            createModalTips(data.msg || '消费成功！');
            oTab.api().ajax.reload(null, false);
        }
    });
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

function send(that) {
    $("#modalAdd_send").modal("show");
    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
}

function doSend() {

    $.ajax({
        url: "/crmorders/update",
        data: {
            uuid: nodeEdit.uuid,
            logisticscode: $("#logisticscode").val(),
            shippercode: $("#shippercode").val()
        },
        type: "put",
        success: function(data) {
            createModalTips(data.msg || '订单状态更新成功！');

            oTab.api().ajax.reload(null, false);

        }
    });
}