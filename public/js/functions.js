$(document).ready(function () {
  /* When clicking on any favorite icon
      the icon swaps from empty to filled
      and image url is added/deleted to the database*/
  $(".favoriteIcon").on("click", function () {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let keyword = urlParams.get("keyword");

    let imageUrl = $(this).prev().attr("src");

    if ($(this).attr("src") == "/img/favorite.png") {
      $(this).attr("src", "/img/favorite_on.png");
      updateFavorite("add", imageUrl, keyword);
    } else {
      $(this).attr("src", "/img/favorite.png");
      updateFavorite("delete", imageUrl);
    }
  }); //favoriteIcon

  $(".keywordLink").on("click", async function () {
    let keyword = $(this).html().trim();
    $("#keywordSelected").val(keyword);
    let response = await fetch(`/api/getFavorites?keyword=${keyword}`);
    let data = await response.json();

    $("#favorites").html("");
    let htmlString = "";
    for (let i = 0; i < data.length; i++) {
      console.log(`DEBUG ${data[i].imageURL}`);
      if(i%3==0){
        htmlString +='<br>';
      }
      htmlString += `<img class='image' src="${data[i].imageURL}" width="200" height="200">`;
      htmlString += "<img class='favoriteIcon' src='img/favorite_on.png' width='20'>";
    }

    $("#favorites").append(htmlString);
  });

  /** 
   * Event listener only applies to content that was present when page is loaded.
   * It does not apply to dynamic content. Add event listener to dynamic content
   * by applying it first to the #favorite div.
   */
  $("#favorites").on("click", ".favoriteIcon", function(){

    let favorite = $(this).prev().attr("src");

    if($(this).attr("src") == 'img/favorite.png') {
      $(this).attr("src","img/favorite_on.png");
      updateFavorite("add",favorite,$("#keywordSelected").val());
    } else {
      $(this).attr("src","img/favorite.png");
      updateFavorite("delete",favorite);
    }
  })

  async function updateFavorite(action, imageUrl, keyword) {
    let url = `/api/updateFavorites?action=${action}&imageUrl=${imageUrl}&keyword=${keyword}`;
    await fetch(url);
  }
}); //document.ready
