(function( $ ){

  var methods = {
    init : function( options ) {

      var settings = {
        filterDelay: 1000,
        url: '',
        page: 0,
        records: 0,
        itensPerPage: 1000,
        resultParser: {
          page: 'page',
          records: 'records',
          itensPerPage: 'itensPerPage'
        }
      };

      function buildListItem(id, text) {
        return '<li class="ui-widget ui-state-default ui-corner-all" id="'+id+'" >'+text+'</li>';
      }

      function buildList(name, optionList) {
        var str = '<ul id="'+name+'">';
        optionList.each(function(index) {
          str += buildListItem(optionList[index].value, optionList[index].text);
        });
        str += '</ul>';
        return str;
      }

      function buildLeftList(e, optionList) {
        var str = '';
        str += '<div style="float: left; width: 45%;" >';
        str += '<div class="connect-ll-top-left ui-corner-top" >';
        str += '<input class="connect-ll-filter" id="'+e.idFilter+'" type="text" />' ;
        str += '<button  id="'+e.idButtonAddAll+'"  >Add All</button>' ;
        str += '</div>';
        str += '<div class="connect-ll connect-ll-left" style="height: '+e.height+'px; " >';
        str += buildList(e.idLeftList, optionList) ;
        str += '</div>' ;
        str += '</div>' ;
        return str;
      }

      function buildRightList(e, optionList) {
        var str = '';
        str += '<div style="float: left; width: 45%;" >';
        str += '<div class="connect-ll-top-right ui-corner-top" >';
        str += '<button id="'+e.idButtonDelAll+'" >Remove All</button>' ;
        str += '</div>';
        str += '<div class="connect-ll connect-ll-right" style="height: '+e.height+'px;" >' ;
        str += buildList(e.idRightList, optionList) ;
        str += '</div>' ;
        str += '</div>' ;
        return str;
      }

      function buildElements(e) {
        var str = '';
        str += '<div id="'+e.idButtonToolBar+'" style="float: left; padding: 2px;" >' ;
        str += ' <div style="height: '+((e.height/2)-30)+'px;" >&nbsp;</div>' ;
        str += ' <div><button id="'+e.idButtonAdd+'" >&gt;</button></div>' ;
        str += ' <div><button id="'+e.idButtonDel+'" >&lt;</button></div>' ;
        str += ' <input type="checkbox" id="'+e.idCheckAddAll+'" name="'+e.idCheckAddAll+'" value="true" style="display: none;">' ;
        str += '</div>' ;
        return str;
      }

      function mouseOverHandler(event) {
        var $target = $(event.target);
        if( $target.is("li") && $target.find('button').length == 0) {
          var $list = $target.parent();
          var $optionList = $list.data('optionList');
          var $otherList = $list.data('otherList');

          $list.find('span').remove();

          if ($list.data('side') == 'left') {

            var $button = $('<button class="ui-widget-content ui-corner-all ui-state-active" onclick="return false;" > + </button>');
            $button.click(function() {
              $target.removeClass('ui-selected');
              $target.find('span').remove();
              $otherList.append($target);
              var id = $target.attr('id');
              $optionList.find('option[value="'+id+'"]').attr('selected', 'selected');
              return false;
            });

            $target.append($('<span></span>').append($button));

          } else {

            var $button = $('<button class="ui-widget-content ui-corner-all ui-state-active" onclick="return false;" > - </button>');
            $button.click(function() {
              $($list.data('check')).removeAttr('checked');
              $target.removeClass('ui-selected');
              $target.find('span').remove();
              $otherList.append($target);
              var id = $target.attr('id');
              $optionList.find('option[value="'+id+'"]').removeAttr('selected');
              return false;
            });

            $target.prepend($('<span></span>').append($button));

          }
        }
      }

      function clickHandler(event) {
        var $target = $(event.target);
        if( $target.is("li") ) {
          $target.toggleClass('ui-selected');
        }
      }

      function fillElements($this) {
        $.ajax({
          url: settings.url,
          data: {
            page: settings.page,
            rows: settings.itensPerPage
          },
          success: function(data){
            if (data) {
              settings.page++;
              alert(data);
              fillElements($this);
            }
          }
        });
      }

      return this.each(function(){

        if ( options ) {
          $.extend( settings, options );
        }

        var s = settings;

        $this = $(this);
        var name = $this.attr('name');
        var e = {
          name: name,
          height: $this.attr('size')*25,
          idButtonToolBar: name + 'ButtonToolBar',
          idFilter: name + 'Filter',
          idLeftList : name + 'LeftList',
          idRightList : name + 'RightList',
          idButtonAddAll : name + 'ButtonAddAll',
          idButtonDelAll : name + 'ButtonDelAll',
          idButtonAdd : name + 'ButtonAdd',
          idButtonDel : name + 'ButtonDel',
          idCheckAddAll : name + 'CheckAddAll'
        };

        var selected = $this.find('option:not(:selected)');
        var unselected = $this.find('option:selected');

        //console.time('building html');
        var leftList = buildLeftList(e, selected);
        var toolBar = buildElements(e);
        var rightList = buildRightList(e, unselected);
        //console.timeEnd('building html');

        //console.time('insert into DOM');
        $this.after('<div class="connect-ll">'+leftList+toolBar+rightList+'</div><div style="clear: both"></div>').hide();
        //console.timeEnd('insert into DOM');

        leftList = $("#"+e.idLeftList);
        rightList = $("#"+e.idRightList);

        $this.data('leftList', leftList);
        $this.data('rightList', rightList);

        leftList.data('side', 'left');
        leftList.data('optionList', $this);
        leftList.data('otherList', rightList);

        rightList.data('side', 'right');
        rightList.data('optionList', $this);
        rightList.data('otherList', leftList);
        rightList.data('check', "#"+e.idCheckAddAll);

        leftList.click(clickHandler).mouseover(mouseOverHandler).mouseleave(function () {
          leftList.find('span').remove();
        });
        rightList.click(clickHandler).mouseover(mouseOverHandler).mouseleave(function () {
          rightList.find('span').remove();
        });

        $("#"+e.idButtonAddAll).button().click(function() {
          $("#"+e.idFilter).val('');
          $("#"+e.idLeftList+" li").show();
          $("#"+e.idCheckAddAll).attr('checked', 'checked');
          $(this).fadeTo("slow", 0.33);
          rightList.append(leftList.find('li'));
          $this.find('option').attr('selected', 'selected');
          return false;
        });

        $("#"+e.idButtonDelAll).button().click(function() {
          $("#"+e.idCheckAddAll).removeAttr('checked');
          $("#"+e.idButtonAddAll).fadeTo('slow', 1.0);
          leftList.append(rightList.find('li'));
          $this.find('option').removeAttr('selected');
          return false;
        });

        $("#"+e.idButtonAdd).button().click(function() {
          $( ".ui-selected", leftList ).each(function() {
            var el = $(this).removeClass('ui-selected');
            rightList.append(el);
            var id = el.attr('id');
            $this.find('option[value="'+id+'"]').attr('selected', 'selected');
          });
          return false;
        });

        $("#"+e.idButtonDel).button().click(function() {
          $("#"+e.idCheckAddAll).removeAttr('checked');
          $("#"+e.idButtonAddAll).fadeTo('slow', 1.0);
          $( ".ui-selected", rightList ).each(function() {
            var el = $(this).removeClass('ui-selected');
            leftList.append(el);
            var id = el.attr('id');
            $this.find('option[value="'+id+'"]').removeAttr('selected');
          });
          return false;
        });

        var filter = function() {
          //console.log('Executando filtro');
          $("#"+e.idLeftList+" li").show();
          var value = $("#"+e.idFilter).val();
          if (value) {
            $("#"+e.idLeftList+" li").filter(
              function (index) {
              return !$(this).text().match('.*'+value+'.*');
            }).removeClass('ui-selected').hide();
          }
        };

        $filter = $("#"+e.idFilter);

        $filter.keyup(function(){
          clearTimeout($filter.data('filter'));
          $filter.data('filter', setTimeout(filter, s.filterDelay));
        });

        if (s.url) {
          fillElements($this);
        }

      });

    },
    addItem : function(id, value) {
      function buildListItem(id, text) {
        return '<li class="ui-widget ui-state-default" id="'+id+'" >'+text+'</li>';
      }

      return this.each(function(){

        var $this = $(this);
        var $leftList = $this.data('leftList');
        var $rightList = $this.data('rightList');

        var option = $this.find('option[value="'+id+'"]');
        if (option.length == 0) {
          option = $('<option value="'+id+'">'+value+'</option>');
          $this.append(option);
        }

        if (option.attr('selected')) {
          $rightList.find('#'+id).remove();
          $rightList.append(buildListItem(id,value));
        } else {
          $leftList.find('#'+id).remove();
          $leftList.append(buildListItem(id,value));
        }

      });

    },
    addItens : function(list, keyStr, valueStr) {
      function buildListItem(id, text) {
        return '<li class="ui-widget ui-state-default" id="'+id+'" >'+text+'</li>';
      }

      return this.each(function(){

        var $this = $(this);
        var $leftList = $this.data('leftList');
        var $rightList = $this.data('rightList');

        var optionHTML = '';
        var leftListHTML = '';
        var rightListHTML = '';

        $.each(list, function() {
          var id = this[keyStr];
          var value = this[valueStr];

          var $option = $this.find('option[value="'+id+'"]');

          if ($option.length == 0) {
            optionHTML += $('<option value="'+id+'">'+value+'</option>');
          }

          if ($option.length > 0 && $option.attr('selected')) {
            rightListHTML += buildListItem(id,value);
          } else {
            leftListHTML += buildListItem(id,value);
          }

        });

        $this.append(optionHTML);
        $leftList.append(leftListHTML);
        $rightList.append(rightListHTML);

      });

    }

  };

  $.fn.connect_ll = function( method ) {

    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.connect_ll' );
    }

  };

})( jQuery );

