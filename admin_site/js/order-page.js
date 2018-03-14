/**
 * Created by ngocnt on 3/12/2018.
 */

jQuery(document).ready(function () {
    GetAllOrder();
});

function GetAllOrder() {
    var dataJSON = {
      sortByTime : -1
    };
    var request = jQuery.ajax({
        type:"GET",
        url: HOST + "order/all",
        dataType:'json',
        data:dataJSON
    });
    request.done(function (data) {
        CreateTable(data);
    });
    request.fail(function (data) {
        console.log("fail roi");
    });
}

function CreateTable(data) {
    var table = jQuery("#order-table");
    data.forEach(function (item) {
        table.append(CreatetRow(item));
    });
}

function CreatetRow(item) {
    var row = jQuery("<tr id='"+item.OrderId+"'></tr>");
    row.append(CreateACell(item.OrderId));
    row.append(CreateACell(item.UserId));
    row.append(CreateACell(item.TotalPrice));
    row.append(CreateACell(item.OrderDate));
    row.append(CreateACell(item.Voucher));
    row.append(CreateACell(item.ApprovederId));
    if (item.OrderStatus == 1){
        row.append(CreateApproveButton(item.OrderId));
        row.append(CreateCancelButton(item.OrderId));
    }
    if (item.OrderStatus == 2){
        row.append(CreateShippingButton(item.OrderId));
        row.append(CreateCancelButton(item.OrderId));
    }
    if (item.OrderStatus == 3){
        row.append(CreateReceivedButton(item.OrderId));
        row.append(CreateCancelButton(item.OrderId));
    }
    if (item.OrderStatus == 4){
        row.append(CreateSuccessCell('Success'));
        row.append(CreateACell(''));
    }
    if(item.OrderStatus == 5){
        row.append(CreateACell(''));
        row.append(CreateCancelCell('Canceled'));
    }

    return row;
}


function CreateACell(data) {
    var cell = jQuery('<td></td>');
    cell.append(data);
    return cell;
}
function CreateSuccessCell(data) {
    var cell = CreateACell(data);
    cell.css('color','greed');
    return cell;
}

function CreateCancelCell(data) {
    var cell = CreateACell(data);
    cell.css('color','red');
    return cell;
}
function CreateShippingButton(id) {
    var button = jQuery('<td class="buttonCell"></td>');
    // var icon = jQuery('<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true" onclick="editProduct()" id=""></i>');
    var icon = jQuery("<button type='button' class='btn btn-primary btn-add' onclick='updateStatusOrder("+id+",3)'><i class='fa fa-truck' aria-hidden='true'></i> Shipping Order</button>");

    button.append(icon);
    return button;
}

function CreateReceivedButton(id) {
    var button = jQuery('<td class="buttonCell"></td>');
    // var icon = jQuery('<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true" onclick="editProduct()" id=""></i>');
    var icon = jQuery("<button type='button' class='btn btn-success btn-add' onclick='updateStatusOrder("+id+",4)'><i class='fa fa-check-square-o' aria-hidden='true'></i> Received</button>");

    button.append(icon);
    return button;
}

function CreateCancelButton(id) {
    var button = jQuery('<td class="buttonCancel"></td>');
    // var icon = jQuery('<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true" onclick="editProduct()" id=""></i>');
    var icon = jQuery("<button type='button' class='btn btn-danger btn-add' onclick='cancelOrder("+id+",5)'>Cancel Order</button>");

    button.append(icon);
    return button;
}

function CreateApproveButton(id) {
    var button = jQuery('<td class="buttonCell"></td>');
    // var icon = jQuery('<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true" onclick="editProduct()" id=""></i>');
    var icon = jQuery("<button type='button' class='btn btn-primary btn-add' onclick='updateStatusOrder("+id+",2)'>Approve Order</button>");

    button.append(icon);
    return button;
}

function updateStatusOrder(id, status) {
    console.log(id);
    var dataJSON={
        orderId : id
    };
    var request = jQuery.ajax({
        type:"GET",
        url: HOST + "order/approve",
        dataType:'json',
        data:dataJSON
    });
    request.done(function (data) {
        console.log("thanh cong roi");
        if (data == 'success'){
            toastr.success("Approve success");
            switch (status){
                case 2:
                    jQuery("#"+id+" .buttonCell").replaceWith(CreateShippingButton(id));
                    break;
                case 3:
                    jQuery("#"+id+" .buttonCell").replaceWith(CreateReceivedButton(id));
                    break;
                case 4:
                    jQuery("#"+id+" .buttonCell").replaceWith(CreateSuccessCell('Success'));
                    jQuery("#"+id+" .buttonCancel").replaceWith(CreateACell(''));
                    break;
                case 5:
                    jQuery("#"+id+" .buttonCell").replaceWith(CreateACell(''));
                    jQuery("#"+id+" .buttonCancel").replaceWith(CreateCancelCell('Canceled'));
                    break;
            }

        }
        if (data == 'fail'){
            toastr.error("Approve fail");
        }
    });
    request.fail(function (data) {
        console.log("fail roi");
        toastr.error("Approve fail!!!");
    });
}

function cancelOrder(id) {
    var dataJSON={
        orderId : id
    };
    var request = jQuery.ajax({
        type:"GET",
        url: HOST + "order/cancel",
        dataType:'json',
        data:dataJSON
    });
    request.done(function (data) {
        console.log("thanh cong roi");
        if (data == 'success'){
            toastr.success("Cancel success");
            jQuery("#"+id+" .buttonCell").replaceWith(CreateACell(''));
            jQuery("#"+id+" .buttonCancel").replaceWith(CreateCancelCell('Canceled'));
        }
        if (data == 'fail'){
            toastr.error('Cancel fail');
        }

    });
    request.fail(function (data) {
        console.log("fail roi");
        toastr.error("Cancel fail!!!");
    });
}