$.views.settings.allowCode(true);
$.views.converters("getResponseModelName", function(val) {
  return getResponseModelName(val);
});

var tempBody = $.templates('#temp_body');
var tempBodyResponseModel = $.templates('#temp_body_response_model');

//获取context path
var contextPath = getContextPath();
function getContextPath() {
  var pathName = document.location.pathname;
  var index = pathName.substr(1).indexOf("/");
  var result = pathName.substr(0,index+1);
  return result;
}

$(function(){
    $.ajax({
        url : "v2/api-docs",
// 	        url : "http://petstore.swagger.io/v2/swagger.json",
        dataType : "json",
        type : "get",
        async : false,
        success : function(data) {
            //layui init
            layui.use([ 'layer','jquery', 'element' ], function() {
	            var $ = layui.jquery, layer = layui.layer, element = layui.element;
	        });
            var jsonData = eval(data);
            
            $("#title").html(jsonData.info.title);
            $("body").html($("#template").render(jsonData));
            
            $("[name='a_path']").click(function(){
	            var path = $(this).attr("path");
	            var method = $(this).attr("method");
	            var operationId = $(this).attr("operationId");
	            $.each(jsonData.paths[path],function(i,d){
	              if(d.operationId == operationId){
                      d.path = path;
                      d.method = method;
		              $("#path-body").html(tempBody.render(d));
                      var modelName = getResponseModelName(d.responses["200"]["schema"]["$ref"]);
                      if(modelName){
                        $("#path-body-response-model").html(tempBodyResponseModel.render(jsonData.definitions[modelName]));
                      }
	              }
	            });
	        });
	        
	        
	       $("[name='btn_submit']").click(function(){
                var operationId = $(this).attr("operationId");
                var parameterJson = {};
                $("input[operationId='"+operationId+"']").each(function(index, domEle){
                    var k = $(domEle).attr("name");
                    var v = $(domEle).val();
                    parameterJson.push({k:v});
                });
            });
        }
    });
    
});


function getResponseModelName(val){
  if(!val){
    return null;
  }
  return val.substring(val.lastIndexOf("/")+1,val.length);
}

//测试按钮，获取数据
function getData(operationId){
   var path = contextPath + $("[m_operationId='"+operationId+"']").attr("path");
   //path 参数
   $("[p_operationId='"+operationId+"'][in='path']").each(function(index, domEle){
       var k = $(domEle).attr("name");
       var v = $(domEle).val();
       if(v){
           path = path.replace("{"+k+"}",v);
       }
   });
   
   var parameterType = $("#sel_pt_"+operationId).val();
   var contentType = $("#sel_pt_"+operationId).find("option:selected").attr("contentType");
   
   //query 参数
   var parameterJson = {};
   if("form" == parameterType){
       $("[p_operationId='"+operationId+"'][in='query']").each(function(index, domEle){
           var k = $(domEle).attr("name");
           var v = $(domEle).val();
           if(v){
               parameterJson[k] = v;
           }
       });
   }else if("json" == parameterType){
       var str = $("#text_tp_"+operationId).val();
       try{
           parameterJson = JSON.parse(str); 
       }catch(error){
           layer.msg(""+error,{icon:5});
           return false;
       }
   }
   
   //发送请求
   $.ajax({
	   type: $("[m_operationId='"+operationId+"']").attr("method"),
	   url: path,
	   data: parameterJson,
	   dataType: 'json',
	   contentType: contentType,
	   success: function(data){
	     var options = {
          withQuotes: true
         };
	     $("#json-response").jsonViewer(data, options);
	   }
   });
}

//更改参数类型
function changeParameterType(operationId){
   var v = $("#sel_pt_"+operationId).val();
   if("form" == v){
        $("#text_tp_"+operationId).hide();
        $("#table_tp_"+operationId).show();
   }else if("json" == v){
       $("#text_tp_"+operationId).show();
       $("#table_tp_"+operationId).hide();
   }
}
