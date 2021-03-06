//screen.js

//    This file is part of Jello Dashboard.
//
//    Jello Dashboard is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    Jello Dashboard is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Jello Dashboard.  If not, see <http://www.gnu.org/licenses/>.
//
//    2008-2012 N.Sivridis http://jello-dashboard.net


//Main jello screen elements
Ext.BLANK_IMAGE_URL = 'img\\s.gif';
Ext.EventManager.on(window, 'load', function() {
    setTimeout(function() {
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({ remove: true });
    }, 250);
    startIntTimer();
});

var waitMask = new Ext.LoadMask(Ext.getBody(), { msg: txtMsgWait + "..." });

var tPlus = {
    id: 'plus',
    handler: function(e, target, panel) {
        previewpanefont(1);
    }
};

var tMinus = {
    id: 'minus',
    handler: function(e, target, panel) {
        previewpanefont(-1);
    }
};


var actionTplMarkup = [
    '<tpl if="typeof(values.notes) != \'undefined\'">',
    '<tpl if="notes != null">',
    '<tpl if="notes != \'\'">',
    '<div style=background:#ffffcc;padding:1 1 1 1;><b>' + txtNotes + '</b>: <i>{[toHtmlLines(values.notes)]}</i><br></div>',
    '</tpl>',
    '</tpl>',
    '</tpl>',
    '<b>{subject}</b>',
    '&nbsp;<i>{tags}</i><br>',
    '{body}'
];

actionTpl = new Ext.XTemplate(actionTplMarkup);

var mailTplMarkup = [
    '<tpl if="typeof(values.to) != \'undefined\'">',
    '<tpl if="values.to.indexOf(\';\') != -1 ">',
    '<div style=background:#ffffcc;padding:1 1 1 1;>To: <i>{to}</i><br></div>',
    '</tpl>',
    '</tpl>',
    '<tpl if="typeof(values.cc) != \'undefined\'">',
    '<tpl if="cc != null">',
    '<tpl if="cc != \'\'">',
    '<div style=background:#ffffcc;padding:1 1 1 1;>cc: <i>{cc}</i><br></div>',
    '</tpl>',
    '</tpl>',
    '</tpl>',
    '<tpl if="typeof(values.attachmentList) != \'undefined\'">',
    '<tpl if="values.attachmentList != \'\'">',
    '<div style=background:#ffffcc;padding:1 1 1 1;>' + txtAttachments + ': <i>{attachmentList}</i><br></div>',
    '</tpl>',
    '</tpl>',
    '<b>{subject}</b>,<br>',
    '{body}'
];

var mailTpl = new Ext.XTemplate(mailTplMarkup);


Ext.info = function() {
    var msgCt;

    function createBox(t, s) {
        return [
            '<div class="msg">',
            '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
            '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h2>', t, '</h2>', s, '<br></div></div></div>',
            '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
            '</div>'
        ].join('');
    }

    return {
        msg: function(title, format) {
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, { id: 'msg-div' }, true);
            }
            //msgCt.alignTo(document, 't-t');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, { html: createBox(title, s) }, true);
            m.slideIn('t').pause(jello.alertSeconds).ghost("t", { remove: true });
            //m.on('mouseover', function(){this.ghost("t", {remove:true});});

        },

        init: function() {
            var t = Ext.get('exttheme');
            if (!t) { // run locally?
                return;
            }
            var theme = Cookies.get('exttheme') || 'aero';
            if (theme) {
                t.dom.value = theme;
                Ext.getBody().addClass('x-' + theme);
            }
            t.on('change', function() {
                Cookies.set('exttheme', t.getValue());
                setTimeout(function() {
                    window.location.reload();
                }, 250);
            });

            var lb = Ext.get('lib-bar');
            if (lb) {
                lb.show();
            }
        }
    };
}();


Ext.onReady(Ext.info.init, Ext.info);
Ext.onReady(function() {
    Ext.QuickTips.init();
    //Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    var sideleft = "east";
    var theActiveTab = "tvpanel";
    if (jello.activeSBPanel == 0) {
        theActiveTab = "reviewpanelparent";
    }
    if (jello.sidebarLeft == true || jello.sidebarLeft == "1") {
        sideleft = "west";
    }
    var rootNode = new Ext.tree.TreeNode({ text: 'jello', expandable: true, expanded: true });

    var viewport = new Ext.Viewport({
        layout: 'border',
        id: 'viewport',
        items: [
            new Ext.BoxComponent({
// raw
                region: 'north',
                el: 'screen',
                height: 50
            }),
            {
                region: 'north',
                id: 'north-panel',
                margins: '2 2 2 2',
                layout: 'anchor',
                border: false,
                html: jelloHeader()
            },
            {
                region: sideleft,
                id: 'west-panel',
                title: searchBox(1),
                split: true,
                width: jello.sidebarWidth,
                minSize: 200,
                maxSize: 500,
                collapsed: !jello.sidebarOn,
                listeners: {
                    expand: function(p) {
                        jello.sidebarOn = true;
                        jese.saveCurrent();
                    },
                    collapse: function(p) {
                        jello.sidebarOn = false;
                        jese.saveCurrent();
                    },
                    bodyresize: function(p, w) { resizeSidebar(p, w); }
                },
                collapsible: true,
                autoScroll: false,
                margins: '0 0 0 0',
                layout: 'anchor',
                border: true,
                scrollable: true,
                layoutConfig: {
                    animate: true
                },
                items: [
                    {
                        //title:txtTools,
                        hideCollapseTool: true,
                        id: 'sbox',
                        html: searchBox(2)
                    },
                    new Ext.TabPanel({
                        id: 'accord',
                        border: false,
                        //autoHeight:true,
                        scrollable: true,
                        defaults: { bodyStyle: 'padding:0px', autoHeight: true },
                        listeners: {
                            tabchange: function(tp, pnl) {
                                var at = pnl.getId();
                                if (at == "tvpanel") {
                                    jello.activeSBPanel = 1;
                                } else {
                                    jello.activeSBPanel = 0;
                                }
                                jese.saveCurrent();
                            }
                        },
                        activeTab: theActiveTab,
                        items: [
                            {
                                title: txtReview2,
                                iconCls: 'navreview',
                                id: 'reviewpanelparent',
                                listeners: { render: function() { updateReviewPanel(); } },
                                autoHeight: true,
                                scrollable: true,
                                //autoScroll:true,
                                listeners: {
                                    activate: function(p) {
                                        if (Trim(p.body.dom.innerText) == txtReview2) {
                                            updateReviewPanel();
                                        }
                                    }
                                },
                                items: [
                                    new Ext.Panel({
                                        title: txtReview2,
                                        tools: [tRvEmpty, tRvPath, tRvPrev, tRvNext, tRvReload],
                                        autoScroll: true,
                                        bodyStyle: 'padding:5px',
                                        id: 'reviewacpanel',
                                        height: Ext.getBody().getViewSize().height - 170
                                    })
                                ]
                            },
                            //tree
                            {
                                title: txtFolderView,
                                iconCls: 'navtree',
                                id: 'tvpanel',
                                tools: [tvReload],
                                bodyStyle: 'padding:2px',
                                //autoScroll:true,
                                listeners: {
                                    activate: function(p) {
                                        if (p.body.dom.innerText.length == 0) {
                                            renderTree();
                                        }
                                    }
                                },
                                items: [
                                    new Ext.tree.TreePanel({
                                        height: Ext.getBody().getViewSize().height - 250,
                                        rootVisible: false,
                                        root: rootNode,
                                        listeners: {
                                            click: nodeClick,
                                            contextmenu: treeMenu,
                                            frame: true,
                                            bodyStyle: 'padding:2px',
                                            nodedragover: nodeDrag,
                                            nodedrop: nodeDrop
                                        },
                                        enableDD: true,
                                        useArrows: true,
                                        containerScroll: true,
                                        scrollable: true,
                                        ddAppendOnly: true,
                                        autoScroll: true,
                                        id: 'tree',
                                        contextMenu: new Ext.menu.Menu({
                                            items: [
                                                {
                                                    id: 'insert-node',
                                                    text: txtInsert,
                                                    icon: 'img\\new.gif'
                                                }, {
                                                    id: 'delete-node',
                                                    text: txtDelete,
                                                    icon: 'img\\delete.gif'
                                                }, '-', {
                                                    id: 'add-shcut',
                                                    text: txtCreShortcut,
                                                    icon: 'img\\shcut.gif'
                                                }, {
                                                    id: 'ol-open',
                                                    text: txtOLOpeninWin,
                                                    hidden: true,
                                                    icon: 'img\\copy.gif'
                                                }, {
                                                    id: 'tg-icon',
                                                    text: "Set Icon",
                                                    hidden: false,
                                                    icon: 'img\\icon.gif'
                                                }, {
                                                    id: 'tag-node',
                                                    text: txtShowWithTag,
                                                    icon: 'img\\task.gif'
                                                }, {
                                                    id: 'edit-node',
                                                    text: txtProps,
                                                    icon: 'img\\page_edit.gif'
                                                }
                                            ],
                                            listeners: {
                                                itemclick: function(item) {
                                                    popUpClick(item.id, item.parentMenu.contextNode);
                                                }
                                            }
                                        }),
                                        border: false,
                                        autoScroll: true

                                    })
                                    //end of tree
                                ]
                            }
                        ]
                    })
                ]
            },
            {
                region: 'center',
                id: 'centerpanel',
                layout: 'border',
                items: [
                    new Ext.ux.Portal({
                        region: 'center',
                        border: false,
                        //autoHeight:true,
                        //id:'centerpanel',
                        xtype: 'portal',
                        bodyStyle: 'overflow-X:hidden;',
                        id: 'portalpanel',
                        margins: '0 0 0 0',
                        autoScroll: false,
                        title: 'JD Home',
                        //
                        deferredRender: false,
                        listeners: {
                            resize: function(p) { resizeGrids(p, 100); }
                        },

                        items: [
                            {
                                contentEl: 'main',
                                html: '',
                                id: 'mainpanel',
                                title: txtHomeStart1,
                                autoWidth: true,
                                margins: '0 0 0 0',
                                listeners: {
                                    titlechange: function(a, b) {
                                        if (b.substr(0, 6) != "<span>") {
                                            try {
                                                toggleOLViewPreview(false);
                                            } catch (e) {
                                            }
                                        }
                                    }
                                },
                                layout: 'accordion',
                                layoutConfig: {
                                    animate: true
                                }
                                //layout:'anchor'
                            }
                        ]
                    }),
                    {
                        region: 'south',
                        id: 'previewpanel',
                        margins: '2 2 2 2',
                        //layout:'anchor',
                        border: true,
                        split: true,
                        collapseFirst: false,
                        bodyCssClass: 'preview',
                        height: jello.actionPreviewHeight,
                        collapsible: true,
                        autoScroll: true,
                        title: infoToolbar(),
                        tools: [tPlus, tMinus],
                        listeners:
                        {
                            resize: function(ts) {
                                jello.actionPreviewHeight = ts.getHeight();
                                jese.saveCurrent();
                            },
                            bodyresize: function(ts, w, h) { resizeGrids(ts, h); },
                            collapse: function(ts, w, h) {
                                if (typeof(getActiveGrid()) != "undefined") {
                                    jello.previewState = 0;
                                    jese.saveCurrent();
                                }
                                resizeGrids(ts, h);
                            },
                            expand: function(ts, w, h) {
                                jello.previewState = 1;
                                jese.saveCurrent();
                                resizeGrids(ts, h);
                            }
                        },
                        collapsed: false,
                        html: txtWdImpWel + ' ' + jelloVersion
                    }
                ]
            }
        ]
    });


    var searchMap = new Ext.KeyMap("finder", [
        {
            key: Ext.EventObject.ENTER,
            fn: function() {
                quickSearch();
            },
            scope: this
        }
    ]);


//screen keymap
    var screenKeyMap = new Ext.KeyMap(document, [
            {
                key: 'h',
                ctrl: true,
                stopEvent: true,
                fn: function() {
                    pHome();
                },
                scope: this
            }, {
                key: Ext.EventObject.F2,
                stopEvent: true,
                fn: function(k, e) {
                    if (e.ctrlKey == true || e.altKey == true || e.shiftKey == true) {
                        return;
                    } else {
                        pCollect();
                    }

                },
                scope: this
            }, {
                key: Ext.EventObject.F2,
                stopEvent: true,
                ctrl: true,
                fn: function() {
                    postItPopup();
                },
                scope: this
            }, {
                key: Ext.EventObject.F3,
                //stopEvent:true, (caused errors in date selectors on entry in inbox screen with F3)
                fn: function(k, e) {
                    if (e.ctrlKey == true || e.altKey == true || e.shiftKey == true) {
                        return;
                    } else {
                        //e.stopEvent=true;
                        //e.stopPropagation=true;
                        pInbox();
                    }
                },
                scope: this
            }, {
                key: Ext.EventObject.F4,
                stopEvent: true,
                fn: function(k, e) {
                    if (e.ctrlKey == true || e.altKey == true || e.shiftKey == true) {
                        return;
                    } else {
                        pReview();
                    }
                },
                scope: this
            }, {
                key: 'r',
                ctrl: true,
                stopEvent: true,
                fn: function() {
                    editAction(null, true);
                },
                scope: this
            }, {
                key: Ext.EventObject.F7,
                ctrl: false,
                alt: false,
                shift: false,
                stopEvent: true,
                fn: function(k, e) {
                    //if(e.ctrlKey==true || e.altKey==true || e.shiftKey==true){return;}else{
                    pTicklers(); //}
                },
                scope: this
            }, {
                key: Ext.EventObject.F8,
                stopEvent: true,
                fn: function(k, e) {
                    if (e.ctrlKey == true || e.altKey == true || e.shiftKey == true) {
                        return;
                    } else {

                        dynamicLoad("masterlist.js", "pMaster()");
                    }
                },
                scope: this
            }, {
                key: 'z',
                ctrl: true,
                stopEvent: true,
                fn: function() {
                    Ext.getCmp("west-panel").expand(false);

                    setTimeout(function() {
                        var ael = document.activeElement.id;
                        if (ael == "finder") {
                            try {
                                var elf = document.getElementById("quickwe");
                                elf.focus();
                            } catch (e) {
                            }
                        } else {
                            finder.focus();
                        }

                    }, 500);

                },
                scope: this
            }, {
                key: 'u',
                ctrl: true,
                stopEvent: true,
                fn: function() {
                    var nd = Ext.getCmp("tree").getSelectionModel().getSelectedNode();
                    if (nd == null) {
                        var nd = Ext.getCmp("tree").getNodeById("tags");
                    }
                    popUpClick("insert-node", nd);
                },
                scope: this
            }, {
                key: 'q',
                ctrl: true,
                alt: true,
                fn: function() {
                    ticklerPopup();
                    status = txtReady;
                },
                stopEvent: true,
                scope: this
            }, {
                //ctrl+alt+l edits the last action
                key: 'l',
                ctrl: true,
                alt: true,
                fn: function() {
                    var lastit = pLatestList(true);
                    if (lastit == null) {
                        alert("No latest Action was found!");
                    } else {
                        scAction(lastit.EntryID);

                    }

                }
            }, {
                key: 'c',
                ctrl: true,
                alt: true,
                fn: function() {
                    postItPopup();
                },
                stopPropagation: true,
                stopEvent: true,
                scope: this
            },
            {
                key: Ext.EventObject.BACKSPACE,
                ctrl: true,
                shift: false,
                fn: function() {
                    pBack();
                },
                stopEvent: true,
                scope: this
            }, {
                key: Ext.EventObject.BACKSPACE,
                ctrl: true,
                shift: true,
                fn: function() {
                    pForw();
                },
                stopEvent: true,
                scope: this
            },
            {
                key: 'g',
                ctrl: true,
                fn: function() {
                    goToFolder(true);
                },
                stopEvent: true,
                scope: this
            }, {
                key: Ext.EventObject.PAGE_DOWN,
                ctrl: true,
                shift: false,
                fn: function() {
                    try {
                        reviewGo(1);
                    } catch (e) {
                    }
                },
                stopEvent: true,
                scope: this
            }, {
                key: Ext.EventObject.PAGE_UP,
                ctrl: true,
                shift: false,
                fn: function() {
                    try {
                        reviewGo(-1);
                    } catch (e) {
                    }
                },
                stopEvent: true,
                scope: this
            }
        ]
    );


//startup actions
    jelloGlobalMenu();
    Ext.getCmp("previewpanel").body.setStyle("font-size", jello.mailPreviewFontSize);
    resizeSidebarTabs();
    updateTheLatestThing();

});

function jelloGlobalMenu() {
    tbar1 = new Ext.Toolbar({ style: 'padding-left:20px;margin-top:0;text-align:center;' });
    tbar1.render('north-panel');
    tbar1.add(
        '-',
        {
            text: 'test',
            cls: 'olrunicon',
            enableToggle: false,
            listeners: { click: function() {} }
        }, '-'
    );
}

function selections() { //j5
//GUI selection links
    var ret = txtSelect + " ";
    ret = ret + hyperLink(txtAll, "checkboxSelection(1)", 0) + ", ";
    ret = ret + hyperLink(txtNone, "checkboxSelection(0)", 0) + ", ";
    ret = ret + hyperLink(txtInvert, "checkboxSelection(2)", 0);
    return ret;
}

function markRow(t) { //j5
//mark list row selected with color
    if (t == null) {
        t = document.activeElement;
    }
    var x = t.parentElement.parentElement;
    if (t.checked == true) {
        x.style.background = "lavender";
    } else {
        x.style.background = "none";
    }
}

function hyperLinkMenu(img, fun, id, info, itid) {
//Icon hyperlinks

    fun = fun.replace(new RegExp("'", "g"), "&quot;");
    var isid;
    if (id != null) {
        isid = "id='" + id + "'";
    }
    ret = "<a class=jellolinkTop " + isid + " onclick='javascript:" + fun + "'><img id=" + itid + " onmouseout=menuOut(" + itid + ") onmouseover=menuOver(" + itid + ") class=menuimg src=img\\" + img + " title='" + info + "'></a>&nbsp;&nbsp;&nbsp;&nbsp;";
    return ret;

}

function menuOver(id) {
    var men = document.getElementById(id);
    id.style.filter = "alpha(opacity=100);";
    id.style.background = "gainsboro";
//id.style.border="1px dotted black";
}

function menuOut(id) {
    var men = document.getElementById(id);
    id.style.filter = "alpha(opacity=70);";
    id.style.background = "";
//id.style.border="0px";
}

function hyperLink(txt, fun, id) {
//GUI paint a function hyperlink
    fun = fun.replace(new RegExp("'", "g"), "&quot;");
    var isid;
    if (id != null) {
        isid = "id='" + id + "'";
    }
    if (id == "stt0") {
        isid = "style=background:yellow; id='" + id + "'";
    }
    var ret = "<a class=jellolink " + isid + " onclick='javascript:" + fun + "'>" + txt + "</a>";
    if (id == 0 || id == null) {
        ret = "<a class=jellolinkTop " + isid + " onclick='javascript:" + fun + "'>" + txt + "</a>";
    }
    return ret;
}


function jelloHeader() { //**j5

    var t = new Date();
    var ret;
    if (jello.appTitle.substr(0, 15) == "Jello Dashboard") {
        jello.appTitle = "Jello Dashboard";
    }
    var apttl = jello.appTitle.replace(new RegExp("'", "g"), "&#39;");
    if (!notEmpty(jello.appTitle) || jello.appTitle == "0") {
        apttl = jelloVersion;
    }
    ret = "";

    ret += "<div id=jello><a class=jellolink title='Back (ctrl+backspace)' onclick=pBack()><img id=backbtn style='opacity:0.4;filter:alpha(opacity=40);' style='margin-top:10px;' src='img\\action_back.gif'></a>&nbsp;<a class=jellolink title='Forward (ctrl+shift+backspace)' onclick=pForw()><img id=forwbtn style='opacity:0.4;filter:alpha(opacity=40);' src='img\\action_forward.gif'></a>&nbsp;</div><div id=datediv>" + t.toLocaleDateString() + " " + DisplayTime(t) + "</div>";
    document.title = apttl;


    ret += "<div id=toptoolbar>";
    ret += hyperLinkMenu("home32.png", "pHome();", 0, txtHome + " [Ctrl+H]", "mim1");
    ret += hyperLinkMenu("collect32.png", "pCollect();", 0, txtCollect + " [F2]\nPopup " + txtCollect + " [Ctrl+W]", "mim2");
    ret += "<span id=topInbox>" + hyperLinkMenu("inbox32.png", "pInbox();", 0, txtInbox + " [F3]", "mim3") + "</span>";
    ret += "<span id=topInbox>" + hyperLinkMenu("new32.png", "editAction(null,true,false);", 0, txtCreate + " [Ctrl+R]", "topCreate") + "</span>";
    ret += "<span id=inboxICount class=jellolinktop></span>";

    ret += hyperLinkMenu("ticklers32.png", "pTicklers();", 0, txtTicklers + " [F7]\n" + txtVwTicklerPopup + " [Ctrl+L]", "mim4");
    ret += hyperLinkMenu("master32.png", "dynamicLoad('masterlist.js','pMaster()');", 0, txtMaster + " [F8]", "mim5");
    ret += hyperLinkMenu("tags32.png", "tagManager()", 0, txtTagsMng, "mim6");
    ret += hyperLinkMenu("settings32.png", "dynamicLoad('settings.js','mngSettings(0)');", 0, txtSettings, "mim7");

    ret += "</div>";

//ret+="<a title='"+txtHome+"' class=jellolinktop id=homie onclick=homePopup()><font face=webdings>111</font></a>";
//<a title='"+txtCollect+" [Ctrl+W]' class=jellolinktop onclick=postItPopup()><font face=webdings>1</font></a>
//ret+="&nbsp;|&nbsp;"+hyperLink(txtCollect,"pCollect();",0)+"&nbsp;<span class=fkey>[F2]</span>&nbsp;<a title='"+txtCollect+" [Ctrl+W]' class=jellolinktop onclick=postItPopup()><font face=webdings>1</font></a>&nbsp;|&nbsp;<span id=topInbox>"+hyperLink(txtInbox,"pInbox();",0);
//ret+="&nbsp;&nbsp;&nbsp;<a title='"+txtVwTicklerPopup+" Ctrl+L' class=jellolinktop onclick=ticklerPopup()><font face=webdings>1</font></a>";
//ret+="</span>&nbsp;<span id=inboxICount class=jellolinktop></span>&nbsp;<span class=fkey>[F3]</span>&nbsp;|&nbsp;<a class=jellolinktopGlow id=topCreate onclick=editAction(null,true,false);>"+txtCreate+"</a>&nbsp;<span class=fkey>[Ctl+R]</span></span><br>"+hyperLink(txtTicklers,"pTicklers();",0)+"&nbsp;<span class=fkey>[F7]</span>";
//ret+="<div id=jello><a class=jellolink title='"+apttl+"' onclick=pHome()><img src='img\\logo.jpg'></a>&nbsp;</div><div id=datediv>"+t.toLocaleDateString()+ " "+DisplayTime(t)+"</div>";


    return ret;
}

function updateMainDate() {
//update main menu date
    try {
        var ht = new Date();
        datediv.innerHTML = ht.toLocaleDateString() + " " + DisplayTime(ht);
    } catch (e) {
    }
//try{hometoprow.innerHTML=homeHeader();}catch(e){}
}

function button(txt, fun) {
    var ret = "&nbsp;<input class='controls' type=button onclick='javascript:" + fun + ";' value='" + txt + "'>";
    return ret;
}


function resizeThings() {
//do nothing let things be resized themselves!
}

function thisWinActive(w) {
    var rt = false;
    var aw = Ext.WindowMgr.getActive();
    if (w == aw) {
        rt = true;
    }
    return rt;
}

function getActiveGrid() {
    var g;
    g = Ext.getCmp("actgrid");
    if (g == null || typeof(g) == "undefined")
        g = Ext.getCmp(thisGrid);
    return g;
}

function searchBox(nm) {
    var ret = "";
    if (nm == 1) {
        ret = "<a class=jellolink onclick=javascript:location.reload() title='" + txtReload + " [F5]'><img src='img\\refresh.gif'></a>&nbsp;&nbsp;<a class=jellolink onclick=javascript:goToFolder(true); title='" + txtGoto + " [Ctrl+G]'><img src='img\\page_bookmark.gif'></a>&nbsp;&nbsp;";
        if (OLversion > 10) {
            ret += "<a class=jellolink onclick=javascript:toggleOLViewPreview(); title='" + txtOPreview + "'><img src='img\\olpreview.gif'></a>&nbsp;&nbsp;";
        }
        ret += "<a class=jellolink onclick=jelloDocs() title='Jello 5 " + txtWdImpDocs + "'><img src=img\\icon_info.gif></a>&nbsp;";
        ret += "<a class=jellolink onclick=about() title='" + txtAbout + "'><img src=img\\j-icon.gif></a>&nbsp;";

    }

    if (nm == 2) {
        ret += "&nbsp;<input type=text tabindex=2 onfocus=finderFocus(); onblur=finderBlur(); title='Search (Ctrl+Z)' value='" + txtFind + "...(ctrl+Z)' size=30 style='width:96%;font-size:12px;BORDER:gray 1px dotted;color:gray;margin-top:6px;margin-bottom:0px;' id=finder>";
        ret += "<table width=100% border=0 cellpadding=4 cellspacing=4 style='font-size:85%;'>";
        ret += "<tr><td width=50%><a class=jellolinkTop onclick=goToFolder(true); title='" + txtGoto + "[Ctrl+G]'>" + txtGoto + "</a></td>";
        ret += "<td width=50%><a class=jellolinkTop id=toplatest onclick=pLatest();>" + txtLatest + "</a></td><td width=50%></td></tr>";
//ret+="<tr><td width=50%><a class=jellolinkTop id=toplatest onclick=pLatest();>"+txtLatest+"</a></td>";
        if (jello.enableBccProcess == true)
            ret += "<tr><td width=50%><a class=jellolinkTop id=topsent onclick=processSentItems();>" + "Process Sent" + "</a></td></tr>";
        else
//	ret +="<td width=50%>&nbsp;</td></tr>";
            ret += "<tr><td width=100% colspan=2><span id=thelatest>&nbsp;</span></td></tr>";
        ret += "</table></p>";
    }
    return ret;
}


function cleanPortal() {
//remove all elements from portal panel
    var pp = Ext.getCmp("portalpanel");
    try {
        var onn = Ext.get("olnative");
        on.removeAllListeners();
        on.remove();
        return;
    } catch (e) {
    }

    if (typeof(pp) != "undefined") {
        pp.removeAll(true);
    }
    panelHeight = Ext.getBody().getViewSize().height;
}

function infoToolbar() {


    var ret = "<span id=jelloCounter>" + txtInfoPane + "</span>";


    return ret;
}

function previewpanefont(n) {

    // get the preview panel font size
    var fsize = Ext.getCmp("previewpanel").body.getStyles("font-size");

    var sz = fsize['font-size'];
    var pos = -1;
    var typ = "";
    // is the size spec'ed in px or %
    if ((pos = sz.indexOf("px")) != -1)
        typ = "px";
    else if ((pos = sz.indexOf("%")) != -1)
        typ = "%";
    else
        return;
    // get the units
    var units = sz.substring(0, pos);
    units = parseInt(units);
    // increase / decrease size, based on type of font-size spec
    // use +/- 1 for px and +/-5 for %
    // the argument to the funciton is -1 or +1 depending on dec or inc
    if (typ == "px")
        units += n;
    else if (typ == "%")
        units += 5 * n;
    // build the font-size string  units number then units
    lastprevsz = units.toString() + sz.substring(pos);
    // set for the panel
    Ext.getCmp("previewpanel").body.setStyle("font-size", lastprevsz);

    jello.mailPreviewFontSize = lastprevsz;

    jese.saveCurrent();

}

function updateCounter(co) {
//update counter with number
    var cspan = document.getElementById("jelloCounter");
    cspan.innerHTML = "" + co + " " + txtItemItems;

    if (co == -1) {
        cspan.innerHTML = infoToolbar();
        status = txtReady;
        return;
    } else {

    }
    status = "" + co + " " + txtItemItems;
    if (co == 0) {
        status = txtReady;
    }
}

function resizeSidebar(pn, w) {
//after resize sidebar update main panel grid widths
    var thisG = getActiveGrid();

    try {
        var panelW = Ext.getBody().getViewSize().width;
        var nw = pn.getWidth();
        jello.sidebarWidth = w;
        jese.saveCurrent();
        var xtra = 5;
        thisG.setWidth((panelW - nw) - xtra);
    } catch (e) {
    }

    resizeSidebarTabs();


}

function resizeGrids(pn, h) {


    Ext.getCmp("previewpanel").doLayout();
    var prwHeight = Ext.getCmp("previewpanel").getHeight();
    var sectWidth = Ext.getCmp("portalpanel").getWidth();
    if (prwHeight == 0) {
        prwHeight = 20;
    }
    var thisG = getActiveGrid();
    if (typeof(thisG) == "undefined") {
        return;
    }
    var panelH = Ext.getBody().getViewSize().height;
    if (thisG.id == "mgrid") {
        thisG.setHeight((panelH - prwHeight) - 74);
    }

    if (thisG.id == "igrid") {
        thisG.setHeight((panelH - prwHeight) - 92);
        thisG.setWidth(sectWidth);
        thisG.doLayout();

    }

    if (thisG.id == "grid") {
        thisG.setHeight((panelH - prwHeight) - 90);
    }

    if (thisG.id == "ggrid") {
        thisG.setHeight((panelH - prwHeight) - 80);
    }

    if (thisG.id == "tgrid") {
        thisG.setHeight((panelH - prwHeight) - 90);
    }

    if (thisG.id == "portalpanel") {

        thisG.setHeight((panelH - prwHeight) - 50);
        thisG.doLayout();
    }

    if (thisG.id == "collectArea") {
        thisG.setHeight((panelH - prwHeight) - 124);
        Ext.getCmp("centerpanel").doLayout();


    }


}

function previewAnyItem(id, itype) {
//show information on the preview panel for any type of object

    var ret = "";
    var ppnl = Ext.getCmp('previewpanel');
    if (ppnl.collapsed) {
        return;
    }
    if (itype > 99) {
        itype = "tg";
    }

    if (itype == "tg") {
        //tags
        var r = getTagByID(id);
        if (r == null) {
            return;
        }
        var tgname = r.get("tag");
        var tp = txtTag;

        if (r.get("isproject")) {
            tp = txtProject;
        }
        if (!r.get("istag")) {
            tp = txtFolder;
        }
        ret = tp + "&nbsp;<b>" + tgname + "</b><br>";
        st = getTagSubs(id);
        if (st > 0) {
            ret += st + " " + txtTags + ", ";
        }
        var ctx = tgname.replace(new RegExp(" ", "g"), "~");
        ret += showContext(tgname, 0) + " " + txtItems + "&nbsp;";
        ret += "<a class=jellolinktop onclick=showContext('" + ctx + "',1);>[" + txtView + "]</a><br>";
        ret += r.get("notes");
    }


    if (itype == "a") {
        var it = NSpace.GetItemFromId(id);

        ret = txtAction + " <b>" + it.Subject + "</b><br>";
        //ret+=it.Categories+";";
        ret += tagList('formtagdisplay', null, it.Categories);
        var dd = new Date(it.itemProperties.item(dueProperty).Value);
        var ddt = DisplayDate(dd);
        if (notEmpty(ddt)) {
            ret += " " + txtDueDate + " @ " + ddt;
        }
    }


    ppnl.update(ret);


/* .///To use add this to a grid
    rowmousedown:function(g,row,e)
    {
    g.getSelectionModel().selectRow(row);
    var r=g.getSelectionModel().getSelected();
    var rid=r.get("entryID");
    var tp=r.get("type");
   			e.stopEvent();
			e.preventDefault();
			e.stopPropagation();
    previewAnyItem(rid,tp);
    },
*/

}

function setSidebarPanelHeights() {
    var prwHeight = Ext.getBody().getViewSize().height;
    var pn = Ext.getCmp("reviewacpanel");
    pn.setHeight(prwHeight * 0.66);
    pn.doLayout();
    var pn = Ext.getCmp("tvpanel");
}

function initScreen(preview, func) {
    cleanPortal();
    pWasOn = false;
//preview panel state is read by setting (last user preference) 
    preview = false;
    if (jello.previewState == "1" || jello.previewState == 1) {
        preview = true;
    }
    if (func == "pHome()") {
        preview = false;
    }
    Ext.getCmp("previewpanel").update(smallAbout());
    if (preview) {
//Ext.getCmp("previewpanel").setVisible(true); 
        Ext.getCmp("previewpanel").expand(true);
        Ext.getCmp("previewpanel").setHeight(jello.actionPreviewHeight);
    } else {
//Ext.getCmp("previewpanel").setVisible(false); 
        Ext.getCmp("previewpanel").collapse(true);
    }
    historyPlace++;
    history[historyPlace] = func;
    var bb = document.getElementById("backbtn");
    var fb = document.getElementById("forwbtn");
    if (historyPlace > 1) {
        alphaFilter(bb, 100);
    } else {
        alphaFilter(bb, 40);
    }
    if (historyPlace + 1 == history.length) {
        alphaFilter(fb, 40);
    } else {
        alphaFilter(fb, 100);
    }
//homie.style.display="inline"; 

}

function alphaFilter(ob, vl) {
    try {
        ob.filters.alpha.opacity = vl;
    } catch (e) {
    }
}

function pBack() {
//back history
    if (historyPlace == 1) {
        return;
    }
    historyPlace--;
    var func = history[historyPlace];
    historyPlace--;
    try {
        eval(func);
    } catch (e) {
    }
}

function pForw() {
//forward history
    if (historyPlace == history.length) {
        return;
    }
    historyPlace++;
    var func = history[historyPlace];
    historyPlace--;
    try {
        eval(func);
    } catch (e) {
    }
}

//customize datepicker object
Ext.override(Ext.DatePicker, {
    startDay: Ext.num(jello.firstDayWeek),
    cancelText: txtCancel,
    dayNames: txtDayList.split(','),
    monthNames: txtMonthList.split(','),
    todayText: txtToday
});

Ext.override(Ext.form.DateField, {
    startDay: Ext.num(jello.firstDayWeek),
    cancelText: txtCancel,
    dayNames: txtDayList.split(','),
    monthNames: txtMonthList.split(','),
    todayText: txtToday
});

function smallAbout() {
    var ret = "<p align=center><table><tr><td><img src=img\\j-icon.gif></td><td><b><font size=1>" + txtWdImpWel + " " + jelloVersion + "</b></font></td></tr></table><br>";
    ret += "By Nicolas Sivridis 2006-2011<br>";
    if (webJDversion != jelloVersion && notEmpty(webJDversion)) {
        ret += "<span class=widgetalert>A new Jello Dashboard version is available. " + webJDversion + " </font><a href='http://www.jello-dashboard.net/download/' target='_blank'><b>Download</b></a></span><br>";
    }
    ret += "For more information visit <a class=jellolinktop href='http://jello-dashboard.net'>http://jello-dashboard.net</a><br>";
    ret += "You can <a class=jellolinktop href='http://www.facebook.com/pages/Jello-Dashboard/56878072257'>be a facebook fan</a> or follow the developer's updates on <a class=jellolinktop href='http://www.twitter.com/nicksiv'>Twitter</a><br>";
    ret += "<br>If you like this software please consider contributing a small <a class=jellolinktop href='https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=druqbar%40gmail%2ecom&item_name=Jello%2eDashboard&no_shipping=2&no_note=1&tax=0&currency_code=EUR&bn=PP%2dDonationsBF&charset=UTF%2d8'><b>donation</b></a> to keep it alive.<br>";
    ret += "<br>";
    ret += "&nbsp;<a class=jellolinktop style=font-weight:normal; onclick=resetWidgets()>Reset Widgets</a></p>";
    return ret;
}

function resizeSidebarTabs() {

    try {
        var sideTabHeight = Ext.getBody().getViewSize().height - Ext.getCmp("north-panel").getHeight() - Ext.getCmp("sbox").getHeight() - 65;
    } catch (e) {
    }
    try {
        Ext.getCmp("reviewacpanel").setHeight(sideTabHeight);
    } catch (e) {
    }
    try {
        Ext.getCmp("tree").setHeight(sideTabHeight - 20);
    } catch (e) {
    }
    try {
        Ext.getCmp("tree").setWidth(jello.sidebarWidth - 10);
    } catch (e) {
    }
    try {
        Ext.getCmp("reviewacpanel").doLayout();
    } catch (e) {
    }
    try {
        Ext.getCmp("tree").doLayout();
    } catch (e) {
    }

    Ext.getCmp("north-panel").setHeight(46);
}

function updateWindowSize() {
    //update window size in case of HTA running app

    if (conStatus == "Outlook ActiveX") {
        if (typeof(oJello.applicationName) == "undefined") {
            return;
        }
        window.resizeTo(jello.htaWidth, jello.htaHeight);
        window.moveTo(screen.width / 2 - jello.htaWidth / 2, screen.height / 2 - jello.htaHeight / 2);
    }
}

function htaResize() {
    if (conStatus == "Outlook ActiveX") {
        if (typeof(oJello.applicationName) != "undefined") {
            jello.htaWidth = document.body.clientWidth;
            jello.htaHeight = document.body.clientHeight;
            jese.saveCurrent();
        }
    }

}


//Grid override for sortings to work
Ext.override(Ext.grid.GridPanel, {
    applyState: function(state) {
        var cm = this.colModel,
            cs = state.columns,
            store = this.store,
            s,
            c,
            colIndex;

        if (cs) {
            for (var i = 0, len = cs.length; i < len; i++) {
                s = cs[i];
                c = cm.getColumnById(s.id);
                if (c) {
                    colIndex = cm.getIndexById(s.id);
                    cm.setState(colIndex, {
                        hidden: s.hidden,
                        width: s.width,
                        sortable: s.sortable,
                        editable: s.editable
                    });
                    if (colIndex != i) {
                        cm.moveColumn(colIndex, i);
                    }
                }
            }
        }
        if (store) {
            s = state.sort;
            if (s) {
                store[store.remoteSort ? 'setDefaultSort' : 'sort'](s.field, s.direction);
            }
            s = state.group;
            if (store.groupBy) {
                if (s) {
                    store.groupBy(s);
                } else {
                    store.clearGrouping();
                }
            }

        }
        var o = Ext.apply({}, state);
        delete o.columns;
        delete o.sort;
        Ext.grid.GridPanel.superclass.applyState.call(this, o);
    },

    getState: function() {
        var o = {
                columns: []
            },
            store = this.store,
            ss,
            gs;

        for (var i = 0, c;
        (c = this.colModel.config[i]); i++) {
            o.columns[i] = {
                id: c.id,
                width: c.width
            };
            if (c.hidden) {
                o.columns[i].hidden = true;
            }
            if (c.sortable) {
                o.columns[i].sortable = true;
            }
            if (c.editable) {
                o.columns[i].editable = true;
            }
        }
        if (store) {
            ss = store.getSortState();
            if (ss) {
                o.sort = ss;
            }
            if (store.getGroupState) {
                gs = store.getGroupState();
                if (gs) {
                    o.group = gs;
                }
            }
        }
        return o;
    }
});