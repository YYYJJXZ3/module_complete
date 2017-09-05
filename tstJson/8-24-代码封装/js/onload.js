 function append(){
            $.getJSON("js/userinfo.json",function(data){
                var $jsontip = $("#jsonTip");
                var strHtml = "";//存储数据的变量
                $jsontip.empty();//清空内容
                $.each(data,function(infoIndex,info){
                    strHtml += `
            <tr>
              <td><b class="roleNum">${info["num"]}</b></td>
              <td>${info["size"]}</td>
              <td>${info["data"]}</td>
                      </tr>
          `;



                })
                $jsontip.html(strHtml);//显示处理后的数据
            })
   }