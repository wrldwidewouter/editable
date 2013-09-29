$(window).load(function(){

    var ajaxurl = "http://localhost/editable/ajax_mysql.php";

    var ImgObjConstr = function (image) {

        // *** Variables *****************************************************
        var img = $(image),
            offl = img.offset().left,
            offt = img.offset().top,
            minw = img.width(),
            minh = img.height(),
            w, h, box, ratio, ori, mode, sizehandle;

            console.log(img.attr('id')); //*******tijdelijk
            console.log(offt+" "+offl);

        // *** Set variable function
        var setvar = function () {
            w = img.width(),
            h = img.height(),
            ratio = h / w,
            offl = img.offset().left,
            offt = img.offset().top;

            // get original size
            ori = new Image();
            ori.src = img.attr('src'),
            ori.onload = function () {
                this.orih = ori.height;
                this.oriw = ori.width;
            };

            if (mode !== 'fixed') {
                minh = h,
                minw = w;
            }
        };

        setvar();

        //set mode & sizehandle
        if (img.attr('width') !== undefined && img.attr('height') !== undefined) {
            mode = 'fixed';
        } else if (img.attr('width') !== undefined) {
            mode = 'size-Y', sizehandle = 's';
        } else if (img.attr('height') !== undefined) {
            mode = 'size-X', sizehandle = 'e';
        } else if (img.attr('width') === undefined && img.attr('height') === undefined) {
            mode = 'free', sizehandle = 's, e, se';
        }

        // *** Build *********************************************************

        //build imageholder 
        img.wrap('<div class="imageholder"/>');
        box = img.parents('.imageholder');
        

        //box.css({'position':'absolute','left':offl,'top':offt});
        
        //build optionbar
        img.before('<div class="optionbar-area"></div>');
        img.before('<div class="optionbar btn-group"></div>');
        img.before('<div id="preloader"></div>');
        $optionbar = img.siblings('.optionbar');
        $optionbar.prepend('<input type="file" name="img-upload" class="img-upload" />');
        $optionbar.prepend('<i class="icon-zoom-in btn btn-primary"></i>');
        $optionbar.prepend('<i class="icon-zoom-out btn btn-primary"></i>');
        $optionbar.prepend('<i class="icon-folder-open btn btn-primary"></i>');

        //build edit-overlay
        img.after('<div class="edit-overlay"></div>');
        $editoverlay = img.siblings('.edit-overlay');
        $editoverlay.append('<div class="edit-button btn btn-primary"><i class="icon-picture"></i> Edit</div>');


        // *** Functions *****************************************
        var makeOverlay = function (e) {
            $(e.target).siblings('.edit-overlay')
                .css('display', 'block')
                .width(minw)
                .height(minh);
        };

        var resize = function (x, y) {

            img.width(x);
            img.height(y);
        };

        var bestfit = function (newImgRatio) {
            if (newImgRatio > minh / minw) {
                w = minw;
                h = minw * newImgRatio;
            } else {
                h = minh;
                w = minh / newImgRatio;
            }
            resize(w, h);
            setvar();
            dragg();
            checkpos();
        };

        var zoom = function (percent) {

            if (w > ori.oriw || h > ori.orih) {
                return false;
            }

            var factr = (percent / 100),
                neww = w * factr,
                newh = h * factr;

            // not smaller than imageholder box
            if (minw <= neww && minh <= newh) {
                w = neww;
                h = newh;
            } else if (minh <= minw * ratio) {
                w = minw;
                h = minw * ratio;
            } else {
                h = minh;
                w = minh / ratio;
            }

            // not larger than original image
            if (ori.oriw < neww || ori.orih < newh) {
                w = ori.oriw;
                h = ori.orih;
            }

            // resize
            resize(w, h);
            dragg();
            checkpos();
            sizable(sizehandle);
            updatetools();
        };

        var dragg = function () {
            var x1 = box.offset().left - (w - minw),
                y1 = box.offset().top - (h - minh),
                x2 = box.offset().left,
                y2 = box.offset().top;
            img.draggable({
                containment: [x1, y1, x2, y2],
                cursor: "-moz-grabbing"
            });
        };

        var checkpos = function () {
            var top = img.position().top,
                left = img.position().left,
                bttm = h + top,
                rght = w + left,
                bttmbox = (box).height(),
                rghtbox = (box).width();

            if (bttm < bttmbox) {
                img.css('top', (bttmbox - h));
            }
            if (rght < rghtbox) {
                img.css('left', (rghtbox - w));
            }
        };

        var resetpos = function () {
            img.css({
                'top': 0,
                'left': 0
            });
        };
        var resetsize = function () {
            img.css({
                'width': '',
                'height': ''
            });
        };
        var resetbox = function () {
            box = img.parents('.imageholder');
            minw = img.parents('.imageholder').width();
            minh = img.parents('.imageholder').height();
        };

        var sizable = function (handle) {
            box.resizable({
                maxHeight: h,
                maxWidth: w,
                handles: handle,
                ghost: true
            });
        };

        var editmode = function (e) {
            e.stopPropagation();
            $(e.target).parents('.edit-overlay')
                .hide()
                .siblings('img')
                .off('.showoverlay')
                .siblings('.optionbar-area')
                .show()
                .on('mouseenter.showoptionbar', showOptionbar)
                .siblings('.ui-resizable-handle')
                .attr('style', 'display: block !important')
                .parent('.imageholder')
                .addClass('edit');
            dragg();
            updatetools();
            if (mode === 'fixed') {
                img.siblings('.ui-resizable-handle')
                    .attr('style', 'display: none !important');
            }
        };


        var showOptionbar = function () {
            box.find('.optionbar').css('top', 0);
        };

        var fileUpload = function (e) {
            e.preventDefault();

            // init
            var imgtarget = $(e.target).parents('.imageholder').find('img'),
                file = $(e.target).get(0).files[0],
                reader = new FileReader();

            //show preloader
            imgtarget.siblings('#preloader').fadeIn('fast');

            //reading done
            reader.onload = function (e) {
                setimg(imgtarget, e.target.result);
            };

            // read file 
            reader.readAsDataURL(file);
        };

        var setimg = function (image, source) {

            newimg = new Image();
            newimg.src = source,

            newimg.onload = function () {

                //hide preloader
                image.siblings('#preloader').fadeOut('fast');

                //set img src
                image.attr("src", newimg.src);
                //reset position
                resetpos();
                resetsize();
                this.box = image.parents('.imageholder'),
                this.ratio = newimg.height / newimg.width;
                var boxwidth = newimg.box.width(),
                    boxheight = newimg.box.height();

                setTimeout(function () {
                    if (mode == "fixed") {
                        bestfit(newimg.ratio);
                        updatetools();
                    } else {
                        image.parents('.imageholder')
                            .width(image.width())
                            .height(image.height());
                        setvar();
                        dragg();
                        checkpos();
                        sizable(sizehandle);
                        updatetools();
                    }
                }, 1);
            };
        };

        var setbox = function (wdth, hght) {
            box.width(wdth).height(hght);
            //box.css({'width': wdth,'height' : hght}); 
        };

        var updatetools = function () {
            var bar = box.find('.optionbar');

            var icon = bar.find('.icon-zoom-out');
            if (w == minw || h == minh) {
                icon.addClass('disabled');
            } else {
                icon.removeClass('disabled');
            }

            icon = bar.find('.icon-zoom-in');
            if (w >= ori.oriw || h >= ori.orih) {
                icon.addClass('disabled');
            } else {
                icon.removeClass('disabled');
            }

        };

        var saveimg = function () {
            img.on('mouseenter.showoverlay', makeOverlay);
            img.siblings('.optionbar').css('top', -34);
            img.siblings('.optionbar-area').hide().off('mouseenter.showoptionbar', showOptionbar);
            box.removeClass('edit');
            img.siblings('.ui-resizable-handle').attr('style', 'display: none !important');
            ajaxpost();
        };
        var ajaxpost = function () {
            console.log('Saving... ' + img.attr('id') );

            var $id = img.attr('id'),
                $type = 'IMG',
                $neww = box.width(),
                $newh = box.height(),
                $cropy = (img.position().top * -1),
                $cropx = (img.position().left * -1),       
                $method = 'update_create',
                $content = img.attr('src'); //nog checken of src dataurl is!!!
                
            $.post(ajaxurl, {
                method: $method, 
                id: $id, 
                content: $content, 
                type: $type,
                crop_start_x: $cropx,
                crop_start_y: $cropy,
                new_width: $neww,
                new_height: $newh,
                zoom_width: w,
                zoom_height: h
            })
            .done(function() { ajaxsuccess();})
            .fail(function() { $('.edit').addClass('ajaxfail');});
            
            function ajaxsuccess(){
                // $('#status span.statustext').html('Saved!');
                // $('#status span.statuspic').html('<i class="icon-ok"></i>');
                // setTimeout(function(){
                //     $('#status').hide();
                // },1000);
            } 
                       
        };
        // *** Events *****************************************

        box.on("resizestop", function (event, ui) {
            resetbox();
            dragg();
            checkpos();
            updatetools();
        });

        //zoom
        box.find('i.icon-zoom-in').on('mousedown', function () {
            zoom(105);
        });
        box.find('i.icon-zoom-out').on('mousedown', function () {
            zoom(95);
        });

        //hide optionbar
        img.siblings('.optionbar').on('mouseleave', function () {
            $(this).css('top', -34);
        });

        //show overlay
        img.on('mouseover.showoverlay', makeOverlay);

        //hide overlay
        box.find('.edit-overlay').on('mouseleave', function (e) {
            $(this).hide();
        });

        //edit
        box.find('.edit-button').on('click', editmode);

        // file icon, trigger file input
        box.find('.optionbar .icon-folder-open').mousedown(function (e) {
            $(e.target).siblings(".img-upload").click();
        });

        // On change file upload
        box.find('.optionbar .img-upload').on('change', fileUpload);

        // Cursor
        box.on('mouseover mouseup', function () {
            if ($(this).hasClass('edit') && (w > minw || h > minh)) {
                $(this).css('cursor', grab);
            }
        }).on('mousedown', function () {
            if ($(this).hasClass('edit') && (w > minw || h > minh)) {
                $(this).css('cursor', grabbing);
            }
        }).on('mouseout', function () {
            $(this).css('cursor', 'auto');
        });
        var grab = 'url("http://www.google.com/intl/en_ALL/mapfiles/openhand.cur") 4 4,-moz-grab',
            grabbing = 'url("http://www.google.com/intl/en_ALL/mapfiles/closedhand.cur") 4 4,-moz-grabbing';

        // Mouse wheel
        if (box.get(0).addEventListener) {
            box.get(0).addEventListener("mousewheel", onscroll, false);
            box.get(0).addEventListener("DOMMouseScroll", onscroll, false);
        } else box.get(0).attachEvent("onmousewheel", onscroll);
        
        function onscroll(e) {
            if ( $(this).hasClass('edit') ){
                // cross-browser wheel delta
                e.preventDefault();
                e = window.event || e;
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                
                if (delta < 0){
                    zoom(95);
                } else {
                    zoom(105);
                }
                if (w>minw || h>minh){
                    $(this).css('cursor',grab);
                } else {
                    $(this).css('cursor','auto');
                }          
            }   
        }

        // Trigger saveimg function on saveimg event
        img.on('saveimg', saveimg);

        // ***********************************************************

        //set imageholder size
        setbox(w, h);

        // sizable
        sizable(sizehandle);

    };

    //trigger custom event on mousedown outside
    $('body').on('mousedown', function (e) {
        e.stopPropagation;
        
        var edit = $('.edit'),
            isinside = $(e.target).parents('.edit').length;

        if (edit.length && !isinside) {
            if ( edit.hasClass('imageholder') ){
                // trigger saveimg event
                var img = edit.find('img');
                $(img).trigger('saveimg');
            } else {
                // trigger savetext event
            }
        }

    });


    //init
    $(function () {

        ImgObj = [];

        $('.editable').each(function () {

            if (this.tagName === 'IMG') {
                ImgObj.push(new ImgObjConstr(this));
            } else {
                //text edit
            }
        });

    });
});