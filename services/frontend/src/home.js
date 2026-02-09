$(document).ready(function () {

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "/";
    return;
  }

  $("#checkFood").on("click", function () {

    const barcode = $("#barcode").val();
    const file = $("#labelImage")[0].files[0];

    if (!barcode && !file) {
      alert("Enter barcode or upload label image");
      return;
    }

    const formData = new FormData();
    if (barcode) formData.append("barcode", barcode);
    if (file) formData.append("foodlabel", file);

    // 🔵 STEP 1: Upload
    $.ajax({
      url: "http://localhost:3000/api/upload/food-label",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        Authorization: `Bearer ${token}`
      },

      success: function (res) {
        const jobId = res.jobId;
        alert("Upload successful. Job ID: " + jobId);

        // 🔵 STEP 2: Analyze using jobId
        analyzeFood(jobId);
      },

      error: function () {
        alert("❌ Upload failed");
      }
    });
  });

  // 🔥 ANALYZE FUNCTION
  function analyzeFood(jobId) {

    $("#ingredientsText").text("Analyzing food label, please wait...");
    $("#result").removeClass("hidden");

    $.ajax({
      url: "http://localhost:3000/api/analyze/foodlabel",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ jobId }),
      headers: {
        Authorization: `Bearer ${token}`
      },

      success: function (res) {
        /*
          res.data → OpenAI / OCR output
          Adjust according to your analyzeImage response
        */

        const ingredients =
          res.data.ingredients ||
          res.data.text ||
          JSON.stringify(res.data);

        $("#ingredientsText").text(ingredients);
      },

      error: function () {
        $("#ingredientsText").text("❌ Analysis failed");
      }
    });
  }

  $("#logout").on("click", function () {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

});