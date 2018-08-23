verifyEventsInit();
createmanagerOptions();

var oTab, nodeEdit, opr;
//根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie("perm");

$("#" + role).remove();
var token = $.cookie("token");

$("select[name=categorys]").on("change", choseCatogery);

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

        language: {
            url: "js/lib/dataTables.chinese.json"
        },
        ajax: {
            url: "/crmcategory/sub",
            type: "GET",
            data: { uuid: $("select[name=categorys]").val() },
            dataSrc: (d) => { return d.category },
            error: cgiDtError
        },

        // drawCallback: function () {
        //     this.api().column(0).nodes().each(function (cell, i) { cell.innerHTML = ++i; });
        // },

        columns: [{
                data: "position",
                render: function(d) {
                    return d == null || d == "" ? "--" : d;
                }
            },
            {
                data: "name",
                render: function(d) {
                    return d == null || d == "" ? "--" : d;
                }
            },
            {
                data: 'uuid',
                render: function(d) {
                    return '<div class="btn-group btn-group-sm" style="min-width:100px;">' +
                        '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body" onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a> '
                    '</div>';
                }
            }
        ],
        "drawCallback": function() {
            $("body > div.tooltip").remove();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}
/*设置提示模态框点击遮罩层不隐藏*/
$("#modalAdd").modal({
    "backdrop": "static",
    "show": false
});


// 创建部门下拉选项
function createmanagerOptions() {
    $("#categorys").empty();
    $.ajax({
        url: "/crmcategory",
        type: 'get',
        data: {
            start: 0,
            length: 100
        },
        success: function(data) {
            if (data.category.length < 1) {
                $("#categorys").append($('<option value="null">暂无一级分类</option>'));
            } else {
                data.category.map((e, i) => {
                    $("#categorys").append($('<option value="' + e.uuid + '">' + e.name + '</option>'));
                });
            }
            oTab = createDt();
        }
    });
};


function choseCatogery() {
    oTab.fnSettings().ajax.data.uuid = $("select[name=categorys]").val();
    dtReloadData(oTab, false);
}

function openAdd() {
    $(".form-horizontal").resetForm();

    opr = "add";
    $("#modalAdd").modal("show");
    $("#myModalLabel").text("添加二级分类");
    $("#modalAdd").find(".form-group i").attr("class", "fa fa-exclamation-circle");
}

function editData(that) {
    $(".form-horizontal").resetForm();

    opr = "edit";

    $("#modalAdd").modal("show");
    $("#myModalLabel").text("修改二级分类");
    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();

    $("#name").val(nodeEdit.name);
    $("#position").val(nodeEdit.position);

    $("#modalAdd").find(".form-group i").attr("class", "fa fa-check-circle-o");


}

function saveUser() {
    if (!verification()) return;

    var parm = {
        position: $("#position").val(),
        name: $("#name").val(),
        parent: $("select[name=categorys]").val()
    };
    if (opr == "add") {
        $.ajax({
            url: "/crmcategory/add",
            data: parm,
            type: 'post',
            success: function(data) {
                if (data) {
                    createModalTips(data.msg || '添加成功！');
                    $("#modalAdd").modal("hide");
                    oTab.api().ajax.reload(null, false);
                }
            },
            error: cgiDtError
        })
    } else if (opr == "edit") {
        parm.uuid = nodeEdit.uuid
        $.ajax({
            url: "/crmcategory/update",
            data: parm,
            type: 'put',
            success: function(data) {
                if (data) {
                    createModalTips(data.msg || '修改信息成功！');
                    $("#modalAdd").modal("hide");
                    oTab.api().ajax.reload(null, false);
                }
            },
            error: cgiDtError
        })
    }
}


function deleteData(that) {
    var node = $(that).closest("tr");
    nodeEdit = oTab.api().row(node).data();
    createModalTips("确定要删除该分类？", "confirmDeleteData");
}


function confirmDeleteData() {
    $.ajax({
        url: "/crmcategory/" + nodeEdit.uuid,
        type: "delete",
        success: function(data) {
            createModalTips(data.msg || '删除成功！');
            oTab.api().ajax.reload(null, false);
        }
    });
}