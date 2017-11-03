// Generated by CoffeeScript 2.0.0-beta4
// Carousel

// 幻燈片。
var Carousel;

Carousel = (function() {
  class Carousel {
    constructor() {
      // 元素初始化函式。
      this.init = this.init.bind(this);
      // 元素摧毀函式。
      this.destroy = this.destroy.bind(this);
      // Play

      // 繼續幻燈片的自動輪播。
      this.play = this.play.bind(this);
      // Pause

      // 暫停幻燈片的自動輪播。
      this.pause = this.pause.bind(this);
      // Slide

      // 向特定方向移動幻燈片。
      this.slide = this.slide.bind(this);
      // Next

      // 移動到下一個幻燈片。
      this.next = this.next.bind(this);
      // Previous

      // 移動到上個幻燈片。
      this.previous = this.previous.bind(this);
      // Slide To

      // 跳到指定的幻燈片。
      this.slideTo = this.slideTo.bind(this);
      // 模組可用的方法。
      this.methods = this.methods.bind(this);
    }

    // 控制元素的 HTML 原始碼。
    controlHTML(left, right) {
      return `<a href=\"#!\" class=\"left\"><i class=\"${left} icon\"></i></a>\n<a href=\"#!\" class=\"right\"><i class=\"${right} icon\"></i></a>`;
    }

    init() {
      var $control, $indicators, $item, $items, active, autoplay, compact, control, i, index, indicator, left, navigable, onChange, overlapped, ref, right, style;
      // 保存這個幻燈片的內容，供日後若需摧毀可重生。
      this.$this.data('content', this.$this.html());
      // 建立項目容器，用來包裹所有的幻燈片。
      $items = $selector('<div>').addClass(this.className.ITEMS);
      // 取得使用者已經擺置的幻燈片。
      $item = this.$this.find(this.selector.CHILD_ITEM);
      // 給第一個幻燈片啟用樣式。
      $item.eq(0).addClass(this.className.ACTIVE);
      // 將這些幻燈片移動到項目容器中。
      $items.append($item);
      // 清除原先幻燈片的所有內容。
      this.$this.html('');
      // 從元素中抓出設定。
      control = this.$this.data('control');
      autoplay = this.$this.data('autoplay');
      indicator = this.$this.data('indicator');
      onChange = this.$this.data('onChange');
      // 如果有控制元素設置。
      if (control !== false) {
        overlapped = control.overlapped ? this.className.OVERLAPPED : '';
        compact = control.style === this.className.COMPACT ? this.className.COMPACT : '';
        // 建立控制元素，並且加上指定的圖示。
        left = control.icon.left;
        right = control.icon.right;
        $control = $selector('<div>').addClass(`${overlapped} ${compact} ${this.className.CONTROLS}`).html(this.controlHTML(left, right));
        // 移動到幻燈片容器中。
        this.$this.append($control);
        // 給控制按鈕加上控制事件。
        this.$this.find(this.selector.CONTROLS_LEFT).on('click', () => {
          return this.previous();
        });
        this.$this.find(this.selector.CONTROLS_RIGHT).on('click', () => {
          return this.next();
        });
      }
      // 將幻燈片容器在控制元素之後插入，
      // 這樣才能透過控制元素的樣式來取決幻燈片容器的樣式。
      // CSS Selector 的 `x + x`。
      this.$this.append($items);
      // 如果有指示器設置。
      if (indicator !== false) {
        overlapped = indicator.overlapped ? this.className.OVERLAPPED : '';
        navigable = indicator.navigable ? this.className.NAVIGABLE : '';
        style = indicator.style === this.className.ROUNDED ? '' : this.className.CIRCULAR;
        // 建立指示器元素，並且決定是否可供導覽點按。
        $indicators = $selector('<div>').addClass(`${navigable} ${overlapped} ${style} ${this.className.INDICATORS}`);
        // 替幻燈片產生指示器的元素。
        for (index = i = 1, ref = $item.length; 1 <= ref ? i <= ref : i >= ref; index = 1 <= ref ? ++i : --i) {
          active = index === 1 ? ` ${this.className.ACTIVE}` : '';
          $indicators.append($selector('<div>').addClass(`${active} ${this.className.ITEM}`));
        }
        // 如果可供導覽點按，則綁定點擊事件。
        if (indicator.navigable) {
          $indicators.find(this.selector.ITEM).each((element, index) => {
            return $selector(element).on('click', () => {
              return this.slideTo(index);
            });
          });
        }
        // 移動到幻燈片容器中。
        this.$this.append($indicators);
      }
      // 初始化索引為零。
      this.$this.data('index', 0);
      if (autoplay) {
        // 如果要自動播放的話則建立計時器。
        return this.play();
      }
    }

    destroy() {
      // 移除所有計時器。
      this.$this.removeTimer('autoplay');
      // 重生幻燈片原本的 HTML 內容。
      return this.$this.html(this.$this.data('content'));
    }

    play() {
      // 如果已經有設置計時器就表示正在播放（或計時器正暫停中）。
      if (this.$this.hasTimer('autoplay')) {
        // 重新啟動計時。
        return this.$this.playTimer('autoplay');
      } else {
        // 如果沒有計時器就建立輪播用的計時器。
        return this.$this.setTimer({
          name: 'autoplay',
          // 時間到了就呼叫切換下一張的函式。
          callback: this.next,
          interval: this.$this.data('interval'),
          looping: true,
          visisble: true
        });
      }
    }

    pause() {
      // 移除這個計時器。
      return this.$this.pauseTimer('autoplay');
    }

    async slide(direction, $nextElement) {
      var $current, $next, index, movingDirection;
      // 如果正在滑動中，則取消本次的指令。
      if (this.$this.data('sliding') === true) {
        return;
      }
      // 標記幻燈片正在滑動中，避免重複執行發生問題。
      this.$this.data('sliding', true);
      // 取得幻燈片移動的方向該往左邊還是右邊。
      movingDirection = direction === 'next' ? 'left' : 'right';
      // 取得目前正在顯示的幻燈片。
      $current = this.$this.find(this.selector.ACTIVE_ITEM);
      // 依照方向來決定下一個幻燈片是哪個元素，如果沒有下個元素則為最後（或第一個），那麼就取得最邊緣的那個元素。
      if ($nextElement !== void 0) {
        $next = $nextElement;
      } else if (direction === 'next') {
        $next = $current.next();
        $next = $next.length === 0 ? this.$this.find(this.selector.FIRST_ITEM) : $next;
      } else {
        $next = $current.prev();
        $next = $next.length === 0 ? this.$this.find(this.selector.LAST_ITEM) : $next;
      }
      // 移除所有指示器的啟用樣式，然後替指定指示器加上已啟用樣式。
      this.$this.find(this.selector.INDICATORS_ITEM).removeClass(this.className.ACTIVE).eq($next.index()).addClass(this.className.ACTIVE);
      // 替下一個幻燈片加上順序。
      $next.addClass(direction);
      // 稍微等待一下。
      await this.delay(30);
      // 替目前的幻燈片加上移動效果。
      $current.addClass(`${this.className.MOVING} ${movingDirection}`);
      // 我們同時也移動下一個幻燈片進來。
      $next.addClass(`${this.className.MOVING} ${movingDirection}`);
      // 設置新的索引。
      index = $next.index();
      this.$this.data('index', $next.index());
      // 呼叫指定事件。
      this.$this.data('onChange').call(this.$this.get(), index);
      // 當目前舊的幻燈片移動完畢時。
      return $current.one('transitionend', () => {
        // 順便移除下個幻燈片的移動效果，並且加上已啟用樣式。
        $next.removeClass(`${this.className.MOVING} ${movingDirection} ${direction}`).addClass(this.className.ACTIVE);
        // 同時移除這個舊的幻燈片樣式。
        $current.removeClass(`${this.className.ACTIVE} ${this.className.MOVING} ${movingDirection} ${direction}`);
        // 滑動已結束。
        return this.$this.data('sliding', false);
      }).emulate('transitionend', this.duration);
    }

    next() {
      return this.slide('next');
    }

    previous() {
      return this.slide('previous');
    }

    slideTo(index) {
      var $eqItem, current, direction;
      $eqItem = this.$this.find(this.selector.ITEMS_ITEM).eq(index);
      current = this.$this.data('index');
      // 如果沒有指定的幻燈片索引或與現在的索引相同則離開。
      if ($eqItem.length === 0 || current === index) {

      } else {
        // 比對目前的索引還有準備跳往的索引來決定應該往又還是往左滑。
        direction = index > current ? 'next' : 'previous';
        return this.slide(direction, $eqItem);
      }
    }

    methods() {
      return {
        // Play

        // 開始播放幻燈片。
        play: () => {
          this.play();
          return ts.fn;
        },
        // Pause

        // 暫停幻燈片。
        pause: () => {
          this.pause();
          return ts.fn;
        },
        // Next

        // 切換下一個幻燈片。
        next: () => {
          this.next();
          return ts.fn;
        },
        // Previous

        // 切換上一個幻燈片。
        previous: () => {
          this.previous();
          return ts.fn;
        },
        // Slide To

        // 跳到指定的幻燈片。
        'slide to': (index) => {
          this.slideTo(index);
          return ts.fn;
        },
        // Get Index

        // 取得目前幻燈片的索引。
        'get index': () => {
          return this.$this.data('index');
        }
      };
    }

  };

  // 模組名稱。
  Carousel.module = 'carousel';

  // 模組屬性。
  Carousel.prototype.props = {
    // 幻燈片換到下一張的毫秒相隔時間。
    interval: 4000,
    // 是否要自動播放。
    autoplay: true,
    // 指示器選項。
    indicator: {
      // 指示器的外觀，`rounded` 為圓角矩形，`circular` 為圓形。
      style: 'rounded',
      // 是否可供轉跳。
      navigable: true,
      // 是否疊加在幻燈片上。
      overlapped: true
    },
    // 控制器選項。
    control: {
      // 控制選項的樣式，`compact` 為較小的按鈕，`full` 為整個側邊區塊
      size: 'compact',
      // 是否疊加在幻燈片上。
      overlapped: true,
      // 圖示選項。
      icon: {
        // 左圖示的圖示名稱。
        left: 'chevron left',
        // 右圖示的圖示名稱
        right: 'chevron right'
      }
    },
    // 當幻燈片變更時所呼叫的函式。
    onChange: function() {}
  };

  // 幻燈片切換動畫效果毫秒。
  Carousel.prototype.duration = 700;

  // 類別樣式名稱。
  Carousel.prototype.className = {
    COMPACT: 'compact',
    ACTIVE: 'active',
    ITEMS: 'items',
    ITEM: 'item',
    OVERLAPPED: 'overlapped',
    CONTROLS: 'controls',
    NAVIGABLE: 'navigable',
    ROUNDED: 'rounded',
    CIRCULAR: 'circular',
    INDICATORS: 'indicators',
    MOVING: 'moving'
  };

  // 選擇器名稱。
  Carousel.prototype.selector = {
    ITEM: '.item',
    CHILD_ITEM: ':scope > .item',
    CONTROLS_LEFT: '.controls > .left',
    CONTROLS_RIGHT: '.controls > .right',
    ITEMS_ITEM: '.items > .item',
    ACTIVE_ITEM: '.items > .item.active',
    FIRST_ITEM: '.items > .item:first-child',
    LAST_ITEM: '.items > .item:last-child',
    INDICATORS_ITEM: '.indicators > .item'
  };

  return Carousel;

})();

ts(Carousel);
