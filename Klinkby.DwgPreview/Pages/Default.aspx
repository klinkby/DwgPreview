<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
<!--    <xmeta name="WebPartPageExpansion" content="full" />-->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <span id="appTitle"></span>
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <div id="licenseMessage"></div>

    <p id="hostCss"></p>
    <div class="dwg-css">
    <pre class="csharpcode"><span class="kwrd">&lt;</span><span class="html">style</span> <span class="attr">type</span><span class="kwrd">="text/css"</span><span class="kwrd">&gt;</span>
img[alt='dwg File'] {
    width: 0;
    height: 0;
    padding: 8px;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAiVJREFUeNqMUztoFFEUPe8zMxvXhLVQECKItmO0UNHKLiiKoLEwgiCyyCJGEQtFsQ0EJIHEiKBNMAqCRJBUikSxilhYCIZAQGuRtdBIdt/He9/sbDIbBR/MvN+555x7mBHeexy5Mlm31lV4XRz5XkBI8e3V3ctb2jctrOaXda5y6sTx7FCIUMhL3mcPsPTl62ZTG3syd//qmbUSOmdrWoOZ5y9IScI52htLuh4DRPz46QzeT93AxYnmIGpjgkgGcwKZGSQXVBAlCWJ6vNR49+AazQrGWkgihf2Fe0P9SNP0dP+l8WcFAh7GOURaQSvF/WadUyG1hx3bt+FgdRIHzo2gt3crOx4otBAIgpKmCCgwobJLpbGwsIi+3Sl29aXw1JojwnUZBAJjoLQMuecOJDn6Xq9jfv5DK0yH/fv2/oPAsQMVWrHOt84CGxGrkBOTWF900ApRUIgGjlDLDYO58Vq4fEPzz5UGfjcNGmydsyScgOhwILgFSwoSL+9Uw9Ge6gQ+PhzC69ELbfDJ29MBt6Z+tQVOO0kiHLv5CLPDZ0Mxj8PXp1CKNQUqUUrigPtLC1mICQG7yyUcvTUdLnne1LMBPRtLKHfFiOjehBbWORCBWUcRJU9pi+zz6C53kSqdydXfInPQkQF//o4SjomAcVpHOD86GwiUFAVFxonODJory28XP30+5HMZnwkKFMTy/zLg23sfGMVOWlfw/+MH1S3x4o8AAwBY5vJVER8FlQAAAABJRU5ErkJggg==');
    background-repeat: no-repeat;
}
<span class="kwrd">&lt;/</span><span class="html">style</span><span class="kwrd">&gt;</span>
</pre>
    </div>
    <button id="goBack" class="dwg-goback"></button>
    <script type="text/javascript" src="../Scripts/App.js" async="async"></script>
    <script type="text/javascript" src="../Scripts/Licensing.js" async="async"></script>
</asp:Content>
