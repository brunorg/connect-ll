(function( $ ){

  $.fn.connect_ll = function(options) {

    var settings = {
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
      return '<li class="ui-widget ui-state-default" id="'+id+'" >'+text+'</li>';
    }

    function buildList(name, optionList, class) {
      var str = '<ul id="'+name+'" class="connectlist '+class+'" style="width: 100%;" >';
      optionList.each(function(index) {
        str += buildListItem(optionList[index].value, optionList[index].text);
      });
      str += '</ul>';
      return str;
    }

    function buildLeftList(e, optionList) {
      var str = '';
      str += '<div style="float: left; width: 45%;" >';
      str += '<div class="connectlistTop ui-corner-top" style="position: relative; height: 35px;" >';
      str += '<input id="'+e.idFilter+'" type="text" style="position: absolute; left: 5px; top: 3px;" />' ;
      str += '<button  id="'+e.idButtonAddAll+'" style="position: absolute; right: 5px; top: 3px;" >Add All</button>' ;
      str += '</div>';
      str += '<div class="connectlist" style="height: '+e.height+'px; overflow-y: auto; " >';
      str += buildList(e.idLeftList, optionList, 'connectlistLeft') ;
      str += '</div>' ;
      str += '</div>' ;
      return str;
    }

    function buildRightList(e, optionList) {
      var str = '';
      str += '<div style="float: left; width: 45%;" >';
      str += '<div class="connectlistTop ui-corner-top" style="height: 35px;">';
      str += '<button id="'+e.idButtonDelAll+'" style="left: 5px; top: 3px;" >Remove All</button>' ;
      str += '</div>';
      str += '<div class="connectlist" style="height: '+e.height+'px; overflow: auto;" >' ;
      str += buildList(e.idRightList, optionList, 'connectlistRight') ;
      str += '</div>' ;
      str += '</div>' ;
      return str;
    }

    function buildElements(e) {
      var str = '';
      str += '<div id="'+e.idButtonToolBar+'" style="float: left; padding: 2px;" >' ;
      str += ' <div style="height: '+((e.height/2)-25)+'px;" >&nbsp;</div>' ;
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

          var $button = $('<button class="ui-widget-content ui-corner-all ui-state-active" onclick="return false;" > &plus; </button>');
          $button.click(function() {
            $target.removeClass('ui-selected');
            $target.find('span').remove();
            $otherList.append($target);
            var id = $target.attr('id');
            $optionList.find('option[value="'+id+'"]').attr('selected', 'selected');
            return false;
          });

          $target.append($('<span>').append($button));

        } else {

          var $button = $('<button class="ui-widget-content ui-corner-all ui-state-active" onclick="return false;" > &minus; </button>');
          $button.click(function() {
            $($list.data('check')).removeAttr('checked');
            $target.removeClass('ui-selected');
            $target.find('span').remove();
            $otherList.append($target);
            var id = $target.attr('id');
            $optionList.find('option[value="'+id+'"]').removeAttr('selected');
            return false;
          });

          $target.prepend($('<span>').append($button));

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

    return this.each(function() {
      if ( options ) {
        $.extend( settings, options );
      }

      var s = settings;

      $this = $(this);
      var name = $this.attr('name');
      var e = {
        name: name,
        height: $this.height(),
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

      console.time('building html');
      var leftList = buildLeftList(e, selected);
      var toolBar = buildElements(e);
      var rightList = buildRightList(e, unselected);
      console.timeEnd('building html');

      console.time('insert into DOM');
      $this.after('<div>'+leftList+toolBar+rightList+'</div><div style="clear: both"></div>').hide();
      console.timeEnd('insert into DOM');

      leftList = $("#"+e.idLeftList);
      rightList = $("#"+e.idRightList);

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
        leftList.find('span').remove();
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
        $("#"+e.idLeftList+" li").show();
        var value = $("#"+e.idFilter).val();
        if (value) {
          $("#"+e.idLeftList+" li").filter(
            function (index) {
            return !$(this).text().match('.*'+value+'.*');
          }).removeClass('ui-selected').hide();
        }
      };

      $("#"+e.idFilter).keyup(function(){
        clearTimeout(filter);
        setTimeout(filter, 500);
      });

      if (s.url) {
        fillElements($this);
      }

    });

  };

})( jQuery );

