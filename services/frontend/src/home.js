$(document).ready(function () {

  /* ─────────────────────────────────────────
     AUTH GUARD
  ───────────────────────────────────────── */
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "/";
    return;
  }

  /* ─────────────────────────────────────────
     IMAGE UPLOAD — preview & clear
  ───────────────────────────────────────── */
  $("#labelImage").on("change", function () {
    const file = this.files[0];
    if (!file) return;
    $("#file-label").text(file.name);
    const reader = new FileReader();
    reader.onload = function (e) {
      $("#img-preview").attr("src", e.target.result);
      $("#img-preview-box").show();
    };
    reader.readAsDataURL(file);
  });

  $("#btn-clear-img").on("click", function () {
    $("#labelImage").val("");
    $("#file-label").text("Click to choose image or drag & drop");
    $("#img-preview-box").hide();
    $("#img-preview").attr("src", "");
  });

  /* Drag & drop visual feedback */
  $("#drop-zone")
    .on("dragover", function (e) { e.preventDefault(); $(this).addClass("drag-over"); })
    .on("dragleave drop", function () { $(this).removeClass("drag-over"); });

  /* ─────────────────────────────────────────
     UI HELPERS
  ───────────────────────────────────────── */
  function cap(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  function showLoader()  { $("#loader").removeClass("hidden").addClass("flex"); }
  function hideLoader()  { $("#loader").addClass("hidden").removeClass("flex"); }
  function showResults() { $("#result").removeClass("hidden"); }
  function hideResults() { $("#result").addClass("hidden"); }

  function showError(msg) {
    $("#error-msg").text(msg);
    $("#error-card").removeClass("hidden").addClass("flex");
  }
  function hideError() {
    $("#error-card").addClass("hidden").removeClass("flex");
  }

  /* ─────────────────────────────────────────
     CHECK FOOD
  ───────────────────────────────────────── */
  $("#checkFood").on("click", function () {
    const barcode = $("#barcode").val().trim();
    const file    = $("#labelImage")[0].files[0];

    if (!barcode && !file) {
      showError("Enter a barcode number or upload a food label image.");
      return;
    }

    hideError();
    showLoader();
    hideResults();

    if (file) {
      uploadAndAnalyze(barcode, file);
    } else {
      lookupOpenFoodFacts(barcode);
    }
  });

  /* Enter key shortcut */
  $("#barcode").on("keydown", function (e) {
    if (e.key === "Enter") $("#checkFood").trigger("click");
  });

  /* ─────────────────────────────────────────
     FLOW A — Open Food Facts (barcode only)
  ───────────────────────────────────────── */
  function lookupOpenFoodFacts(barcode) {
    $.ajax({
      url: `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      method: "GET",
      success: function (data) {
        if (data.status !== 1 || !data.product) {
          showError("🚫 No product found for this barcode. Try another one!");
        } else {
          renderOpenFoodFacts(data.product);
        }
      },
      error: function () {
        showError("❌ Network error. Please check your connection.");
      },
      complete: hideLoader
    });
  }

  /* ─────────────────────────────────────────
     FLOW B — Backend API (image upload)
  ───────────────────────────────────────── */
  function uploadAndAnalyze(barcode, file) {
    const formData = new FormData();
    if (barcode) formData.append("barcode", barcode);
    formData.append("foodlabel", file);

    $.ajax({
      url: "http://localhost:3000/api/upload/food-label",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) { analyzeFood(res.jobId); },
      error: function () {
        hideLoader();
        showError("❌ Upload failed. Please try again.");
      }
    });
  }

  function analyzeFood(jobId) {
    $.ajax({
      url: "http://localhost:3000/api/analyze/foodlabel",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ jobId }),
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        hideLoader();
        const data = res.data;
        if (!data) { showError("No data returned from server."); return; }
        renderBackendData(data);
      },
      error: function () {
        hideLoader();
        showError("❌ Analysis failed. Please try again.");
      }
    });
  }

  /* ─────────────────────────────────────────
     RENDER — Open Food Facts
  ───────────────────────────────────────── */
  function renderOpenFoodFacts(p) {
    const imgSrc = p.image_front_url || p.image_url || "";
    if (imgSrc) {
      $("#product-img").attr("src", imgSrc).removeClass("hidden");
      $("#no-img").hide();
    } else {
      $("#product-img").addClass("hidden");
      $("#no-img").show();
    }

    $("#product-name").text(p.product_name || p.product_name_en || "Unknown Product");
    $("#product-brand").text(p.brands ? `by ${p.brands}` : "");

    const $tags = $("#product-tags").empty();
    (p.categories_tags || []).slice(0, 3)
      .map(t => t.replace("en:", "").replace(/-/g, " "))
      .forEach(cat => {
        $tags.append(`<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono tag-gray">${cap(cat)}</span>`);
      });
    if (p.nova_group) {
      const cls = p.nova_group <= 2 ? "tag-green" : p.nova_group === 3 ? "tag-yellow" : "tag-red";
      $tags.append(`<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono ${cls}">NOVA ${p.nova_group}</span>`);
    }

    $("#vegBadges").empty();
    if (p.labels_tags) {
      if (p.labels_tags.includes("en:vegetarian"))
        $("#vegBadges").append(`<span class="px-3 py-1 rounded-full text-xs font-semibold tag-green">🌱 Vegetarian</span>`);
      if (p.labels_tags.includes("en:vegan"))
        $("#vegBadges").append(`<span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.25)">🥬 Vegan</span>`);
    }

    const grade = p.nutriscore_grade || p.nutrition_grade_fr;
    if (grade) {
      $("#nutri-section").removeClass("hidden");
      ["a","b","c","d","e"].forEach(g => $(`#ng-${g}`).toggleClass("active", g === grade.toLowerCase()));
    } else {
      $("#nutri-section").addClass("hidden");
    }

    const n = p.nutriments || {};
    const stats = [
      { label: "Energy",   value: n.energy_value           ? `${Math.round(n.energy_value)} ${n.energy_unit||"kJ"}` : null },
      { label: "Calories", value: n["energy-kcal_100g"]    ? `${Math.round(n["energy-kcal_100g"])} kcal`            : null },
      { label: "Fat",      value: n.fat_100g        != null ? `${n.fat_100g}g`          : null },
      { label: "Carbs",    value: n.carbohydrates_100g != null ? `${n.carbohydrates_100g}g` : null },
      { label: "Sugars",   value: n.sugars_100g     != null ? `${n.sugars_100g}g`       : null },
      { label: "Protein",  value: n.proteins_100g   != null ? `${n.proteins_100g}g`     : null },
      { label: "Salt",     value: n.salt_100g       != null ? `${n.salt_100g}g`         : null },
      { label: "Fiber",    value: n.fiber_100g      != null ? `${n.fiber_100g}g`        : null },
    ].filter(s => s.value);

    const $grid = $("#nutritionGrid").empty();
    $("#nutritionTable").empty();

    if (stats.length) {
      $grid.css("display", "grid");
      stats.forEach(s => {
        $grid.append(`
          <div class="stat-card">
            <div class="font-clash font-bold text-2xl leading-none" style="color:#6C8EEF">${s.value}</div>
            <div class="font-mono text-[0.65rem] mt-1.5" style="color:#7c84a0">${s.label} / 100g</div>
          </div>
        `);
      });
    } else {
      $grid.css("display", "none");
    }

    const $ing = $("#ingredients-content").empty();
    $("#ingredientsList").empty();
    const allergenTexts = (p.allergens || "").toLowerCase();

    if (p.ingredients && p.ingredients.length > 0) {
      const $wrap = $("<div>").addClass("flex flex-wrap gap-2");
      p.ingredients.forEach(ing => {
        const name = (ing.text || ing.id || "").replace(/^en:/i, "").replace(/-/g, " ");
        const isAllergen = allergenTexts.includes(name.toLowerCase());
        $wrap.append(
          $("<span>").addClass(`ing-chip inline-block px-3 py-1.5 rounded-full text-[0.8rem] cursor-default${isAllergen ? " allergen" : ""}`).text(cap(name))
        );
      });
      $ing.append($wrap);
    } else if (p.ingredients_text) {
      $ing.append($("<p>").addClass("text-sm leading-relaxed font-mono").css("color","#7c84a0").text(p.ingredients_text));
    } else {
      $ing.html('<p class="text-sm" style="color:#7c84a0">No ingredient data available.</p>');
    }

    renderAllergens(p.allergens_tags || p.traces_tags || []);
    showResults();
  }

  /* ─────────────────────────────────────────
     RENDER — Backend API data
  ───────────────────────────────────────── */
  function renderBackendData(data) {
    $("#product-img").addClass("hidden");
    $("#no-img").show();
    $("#product-name").text(data.product_name || "Scanned Product");
    $("#product-brand").text(data.brand ? `by ${data.brand}` : "");
    $("#product-tags").empty();
    $("#nutri-section").addClass("hidden");

    $("#vegBadges").empty();
    if (data.is_vegetarian)
      $("#vegBadges").append(`<span class="px-3 py-1 rounded-full text-xs font-semibold tag-green">🌱 Vegetarian</span>`);
    if (data.is_vegan)
      $("#vegBadges").append(`<span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.25)">🥬 Vegan</span>`);

    const $ing = $("#ingredients-content").empty();
    const $wrap = $("<div>").addClass("flex flex-wrap gap-2");
    (data.ingredients || []).forEach(i => {
      $wrap.append($("<span>").addClass("ing-chip inline-block px-3 py-1.5 rounded-full text-[0.8rem] cursor-default").text(i));
    });
    $ing.append($wrap);

    const $grid = $("#nutritionGrid").empty();
    let hasNut = false;
    if (data.nutrients) {
      hasNut = true;
      for (const key in data.nutrients) {
        const label = key.replace(/_/g," ");
        const value = data.nutrients[key];
        $grid.append(`
          <div class="stat-card">
            <div class="font-clash font-bold text-2xl leading-none" style="color:#6C8EEF">${value}</div>
            <div class="font-mono text-[0.65rem] mt-1.5 capitalize" style="color:#7c84a0">${label} / 100g</div>
          </div>
        `);
      }
    }
    $grid.css("display", hasNut ? "grid" : "none");

    if (data.allergens && data.allergens.length > 0) {
      $("#allergenBox").removeClass("hidden");
      $("#allergen-grid, #allergenList").empty();
      data.allergens.forEach(a => {
        $("#allergen-grid").append(`
          <div class="rounded-xl px-3 py-2 text-sm flex items-center gap-2" style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.22);color:#f87171">
            ⚠ ${a}
          </div>
        `);
      });
    } else {
      $("#allergenBox").addClass("hidden");
    }

    showResults();
  }

  /* Allergen helper */
  function renderAllergens(tags) {
    const names = tags.map(a => a.replace(/^en:/i,"").replace(/-/g," "));
    if (names.length) {
      $("#allergenBox").removeClass("hidden");
      $("#allergen-grid, #allergenList").empty();
      names.forEach(a => {
        $("#allergen-grid").append(`
          <div class="rounded-xl px-3 py-2 text-sm flex items-center gap-2" style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.22);color:#f87171">
            ⚠ ${cap(a)}
          </div>
        `);
      });
    } else {
      $("#allergenBox").addClass("hidden");
    }
  }

  /* ─────────────────────────────────────────
     RESET
  ───────────────────────────────────────── */
  $("#btn-reset").on("click", function () {
    hideResults();
    hideError();
    $("#barcode").val("");
    $("#labelImage").val("");
    $("#file-label").text("Click to choose image or drag & drop");
    $("#img-preview-box").hide();
    $("#nutritionGrid").empty().css("display","none");
    $("html, body").animate({ scrollTop: 0 }, 350);
  });

  /* ─────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────── */
  $("#logout").on("click", function () {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

});