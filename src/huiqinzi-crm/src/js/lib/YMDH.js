(function ($) {
    $.extend({
        ms_DatePicker: function (options) {
            var defaults = {
                YearSelector: "#sel_year",
                MonthSelector: "#sel_month",
                DaySelector: "#sel_day",
                HourSelector: "#sel_hour",
                FirstText: "--",
                FirstValue: null
            };
            var opts = $.extend({}, defaults, options);
            var $YearSelector = $(opts.YearSelector);
            var $MonthSelector = $(opts.MonthSelector);
            var $DaySelector = $(opts.DaySelector);
            var $HourSelector = $(opts.HourSelector);
            var FirstText = opts.FirstText;
            var FirstValue = opts.FirstValue;
            var currentDate = new Date();
            // 初始化
            var str = "<option value=\"" + FirstValue + "\">" + FirstText + "</option>";
            
            //年份必选
            $YearSelector.html('');
            $MonthSelector.html(str);
            $DaySelector.html(str);
            $HourSelector.html(str);
            
            // 年份列表
            var yearNow = currentDate.getFullYear();
            for (var i = yearNow; i >= 1900; i--) {
                var sed = yearNow == i ? "selected" : "";
                var yearStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
                $YearSelector.append(yearStr);
            }
            
            // 月份列表
            var monthNow = currentDate.getMonth() + 1;
            for (var i = 1; i <= 12; i++) {
                var sed = monthNow == i ? "selected" : "";
                var monthStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
                $MonthSelector.append(monthStr);
            }
            
            // 日列表(仅当选择了年月)
            function BuildDay(init) {
                if ($YearSelector.val() === 'null' || $MonthSelector.val() === 'null') {
                    // 未选择年份或者月份
                    $DaySelector.html(str);
                } else {
                    $DaySelector.html(str);
                    var year = parseInt($YearSelector.val());
                    var month = parseInt($MonthSelector.val());
                    var dayCount = 0;
                    switch (month) {
                        case 1:
                        case 3:
                        case 5:
                        case 7:
                        case 8:
                        case 10:
                        case 12:
                            dayCount = 31;
                            break;
                        case 4:
                        case 6:
                        case 9:
                        case 11:
                            dayCount = 30;
                            break;
                        case 2:
                            dayCount = 28;
                            if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
                                dayCount = 29;
                            }
                            break;
                        default:
                            break;
                    }
                    
                    var dateNow = currentDate.getDate();
                    for (var i = 1; i <= dayCount; i++) {
                        var sed = init && dateNow == i ? "selected" : "";
                        var dayStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
                        $DaySelector.append(dayStr);
                    }
                }
            }
            
            BuildDay(true);
            
            // 小时列表
            var hourNow = currentDate.getHours();
            for (var i = 0; i <= 23; i++) {
                var sed = hourNow == i ? "selected" : "";
                var hourStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
                $HourSelector.append(hourStr);
            }
            
            $MonthSelector.change(function () {
                BuildDay();
            });
            $YearSelector.change(function () {
                BuildDay();
            });
        } // End ms_DatePicker
    });
})(jQuery); 