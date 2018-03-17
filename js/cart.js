$(document).ready(function () {
    Getcart();
    refreshbutton();
});

var storedAry
var curentIdx
function Getcart(){
    var locStg= localStorage.getItem('cartlist');
    if(locStg==null || locStg==""){
        var list = $("#left-site");
        list.append('<h1>Empty cart</h1>');
        return;
    }else{
        var dataJSON ={
            id:[],
        };

        storedAry = JSON.parse(locStg);
        storedAry.forEach(function (item,index) {
            dataJSON.id.push(item.id);
        });
        var request = jQuery.ajax({
            type:"GET",
            url: HOST + "cart/products",
            dataType:'json',
            data:dataJSON,
            header: {"Access-Control-Allow-Origin":true},
            traditional: true
        });
        request.done(function (data) {
            console.log(data);
            CreateList(data);
        });
        request.fail(function (data) {
           console.log("fail roi");
        });
        updateTotalBill();
    }
    
}
function  CreateList(thisItem) {
    var list = $("#left-site");
    if(thisItem!=null)
        thisItem.forEach(function (item,index) {       
            curentIdx=index;
        	list.append(CreateItem(item));
        });
}
function CreateItem(pst) {
    var item = $('<div class="item-cart item-content"></div>');

    var imageContainer = $('<div class="item-image"></div>');
    var itemImage = CreateImage(pst.Images,pst.Name); 
    imageContainer.append(itemImage);

    var content = $('<div class="item-info"></div>');
    var name = $('<div class="item-name"><p>'+pst.Name+'</p></div>');    
    content.append(name);

    var prices = $('<div class="item-price"></div>');
    var stockPrice = $('<p class="stockPr">'+pst.Price+currency+'</p>');
    if(pst.Discount>0){
        var discountPrice = $('<p class="disPrice">'+calDiscount(pst.Price,pst.Discount)+currency+'</p>');   
        prices.append(discountPrice);
        stockPrice.css({"text-decoration": "line-through", "font-size": "17px"});
    }
    prices.append(stockPrice);
    content.append(prices);

    var size = $('<div class="item-size"></div>');
    size.append($('<div class="size-title">Size</div>'));
    var sizeList = $('<div class="list-size"></div>');
    if(pst.Sizes!=null && pst.Sizes.length>0){
        pst.Sizes.forEach(function (item,index) {
            sizeList.append($('<span class="size-item">'+item+'</span>'));
        });
    }
    content.append(size);

    var quantity = $('<div class="item-quantity"></div>');
    quantity.append($('<div class="quantity-title">Quantity</div>'));
    var quantityValue = storedAry[curentIdx].quantity;
    var quantityInput = $('<input type="text" class="custom-select" value="'+quantityValue+'"/>');
    quantity.append(quantityInput);
    content.append(quantity);

    var total = $('<div class="item-total"></div>');
    total.append('<p class="total-title">Total</p>');
    total.append('<p class="total-price">$'+calTotal(pst.Price,quantityValue)+'</p>');
    
    item.append(imageContainer);
    item.append(content);
    item.append('<div class="close-button" id="'+pst.ProductId+'" onclick="removeItem(this)">x</div>');
    item.append(total);
    // item.append();
    return item;
}

function CreateImage(src, name) {
    // var itemImage = $('<div class="item-image"></div>');
    var image = $("<img/>");
    var urlImg = 'img/No_Image_Available.jpg';
    if (src != '' && src!=null){
        urlImg =  src[0].Url;;
    }
    // alert();
    image.attr('src', urlImg);
    image.attr('alt',name);
    return image;
}
function calTotal(a,b){
	return 0+(+a)*(+b);
}
function calDiscount(price, dis){
    return (+price)-(+price)/100*(+dis);

}

//
function removeItem(idx) {
    var removeId=idx.id;
    storedAry.forEach(function (item,index) {
        if(removeId===item.id){
            storedAry.splice(index, 1);
            // alert("arr "+storedAry.length);
            if(storedAry.length>0){
                localStorage.setItem('cartlist', JSON.stringify(storedAry));
            }else{
                localStorage.removeItem('cartlist');
            }
            location.reload();
            return true;
        }
    });
}

var coupon;
function checkCp() {
    var couponCode= $('#copcode').val();
    coupon=couponCode;
    var dataJSON ={
        voucher: couponCode,
    }
    var request = jQuery.ajax({
            type:"GET",
            url: HOST + "voucher/exist",// cho nay chua co
            dataType:'json',
            data:dataJSON,
            header: {"Access-Control-Allow-Origin":true},
            traditional: true
        });
        request.done(function (data) {
            console.log(data);
            couponValid(data);
            updateTotalBill();
        });
        request.fail(function (data) {
           console.log("fail roi");
        });
}

var discount;

function couponValid(boo){
    if(boo!="fail"){
        $('.btn-coupon').attr("disabled", "disabled");
        $('.btn-coupon').addClass("btn btn-success");
        $('.btn-coupon').attr("value", "Success");
        // alert("check");
        updateDiscount(boo);
    }else{
        $('.btn-coupon').addClass("btn btn-danger");
        $('#copcode').attr("placeholder","Coupon not exist");
        $('.btn-coupon').attr("value", "try another");
        $('#copcode').val("");
        $('.discountnum').text('$0');          
        discount=null;
    }

}
function refreshbutton(){
    $("#copcode").on("change paste keyup", function() {
       // alert($(this).val()); 
       $('.btn-coupon').prop("disabled", false);
    $('.btn-coupon').removeClass("btn btn-success");
    $('.btn-coupon').removeClass("btn btn-danger");
    $('.btn-coupon').attr("value", "Check my coupon");

    });
}
function updateDiscount(disc){
    var type = disc.slice(0,1);
    var disnum = disc.slice(1);
    discount = {
            distype:type,
            num:disnum,
        };
    if(type == "$"){
        $('.discountnum').text('-'+disnum+currency);           
    }else{
        $('.discountnum').text('-'+disnum+'%');          
    }
    
}
    
var bill;
function updateTotalBill(){
    var total =0;
    var lasttotal;
    storedAry.forEach(function (item,index) {
        total+= (+item.lastPrice)*(+item.quantity);
    });
    lasttotal=total;
    $(".total-undis").text(total+currency);
    // alert(total);
    if(discount!=null){
        var type = discount.distype;
        if(type == "$"){
            lasttotal =  total-(+discount.num);
        }else{
            lasttotal =  total-(total/100*(+discount.num));
        }
    }
    bill={
        total:lasttotal,
        disct:discount,
    };
    $(".total-last").text(lasttotal+currency);   
}
function checkoutCart(){
    if(storedAry!=null){
        if(checklogin()){
            createOrder();
            window.location.replace("checkout-fill-info.html");
        }else{
            alert('please login to checkout <3 ');
            window.location.replace("login.html");
        }
    }
}
function createOrder(){
    var order = {
        username:JSON.parse(sessionStorage.getItem('customer')),
        productslist:storedAry,
        orderbill:bill,
        voucher:coupon,
    }
    sessionStorage.setItem('order', JSON.stringify(order));
}
function checklogin(){
    var username=JSON.parse(sessionStorage.getItem('customer'));
    if (username!=null && username!="")
        return true;
    else
        return false;
}

$(document).ready(function () {
    $('#copcode').keydown(function(e) {
        if (e.keyCode == 13) {
            $('.btn-coupon').focus();
            checkCp();
        }
        // alert(e.keyCode);
    });
});