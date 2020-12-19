$(function(){

	$("#data").on("input", function() {
		value = $(this).val();
		// console.log(value);
		var first_s = !(value[0].match(/[ \n,]/i));
		value = (first_s) ? value.replace(/([^0-9 \n,])+/i,'') : value.replace(/([^0-9])+/i,'');
		$(this).val(value);
	});

	$('#submit-btn').on("click", function(){
    var val = $('#data').val();
    val = val.replace(/([^0-9 \n,])+/ig,'');
    $('#data').val(val);
    val = $('#data').val();

		var ary1 = strToArray(val);
		// console.log("ary1 = ", ary1);
    // console.log(JSON.stringify(ary1,null,'\t'));

    var error = checkData(ary1).error;

    // console.log("error = ", error);

    if (val == "") {
      var error = "入力されていません";
    }

    if (error.length > 0) {
      console.log("error: ", error);
      $('#error').html(error).addClass("text-danger");

      $("#compulsory-score").html("");
      $("#elective-score").html("");
      $("#score").html("");
      $("#compulsory-counter").html("");
      $("#elective-counter").html("");
      $("#score-error").html("");

      $("#score").removeClass("list-group-item-primary");
    } else {
      $('#error').html("").removeClass("text-danger");

      var ary2 = checkData(ary1).array;
      // console.log(JSON.stringify(ary2,null,'\t'));

      var ans_dict = keisyozokuCalc(ary2);
      $("#compulsory-score").html(ans_dict.compulsory_score);
      $("#elective-score").html(ans_dict.elective_score);
      $("#score").html(ans_dict.score);
      $("#compulsory-counter").html(ans_dict.compulsory_counter);
      $("#elective-counter").html(ans_dict.elective_counter);

      $("#score-error").html(ans_dict.error);

      if (ans_dict.success) {
        $("#score-error").removeClass("text-danger").addClass("text-success");
      } else {
        $("#score-error").removeClass("text-success").addClass("text-danger");
      }

      $("#score").addClass("list-group-item-primary");

      const position = $('#ans').offset().top;
      $("html,body").animate({scrollTop : position}, {queue : false});
    }
  });

  $('#reset-btn').on("click", function(){
    $("#data").val("");
  });

  $("#to-form").on("click", function(){
    const position = $('#form').offset().top;
    $("html,body").animate({scrollTop : position}, {queue : false});
  });
});

// 文字列からカンマで区切った二次元配列に変換
function strToArray(str) {
	let ary1 = str.replace(/ +/g, '').split(/\n/);
	var ary2 = [];
	for (let s of ary1) {
		ary2.push(s.split(",").filter(i => i !== "").map( str => parseInt(str, 10) ));
  }
  ary2 = ary2.filter(i => i.length > 0)
	return ary2;
}

// 配列の値が正しいかをチェック
function checkData(array) {
  error = "";
  const array_origin = JSON.parse(JSON.stringify(array));
  // console.log(`array_origin: ${array_origin}`);
  for (var i=0;i<array.length;i++) {
    array[i][2] = (array[i][2] >= 1) ? 1 : 0;
    var ary = array[i];
    if (ary.length != 3 || ary[1] == null) {
      // console.log(`array_origin: ${array_origin}`);
      error += `要素数が正しくない行があります． 入力 ${i+1}行目: "${array_origin[i]}"<br>`;
      // error += "There is a line with an incorrect number of elements";
      continue;
    }
    if (ary[0] < 0 || ary[0] > 100) {
      error += `点数が 0点以上 100点以下でないものがあります． 入力 ${i+1}行目: "${array_origin[i]}"<br>`;
      // error += "There is a line with an incorrect number of elements";
    }
  }
  return {error: error, array: array};
}

// 各要素の数を個数順に並べて出力
function counter(array) {
  var array_ans = []
  var array_values = []
  for (v of array) {
      // console.log("arr = " , v);
      if (array_values.includes(v)) {
          var i = array_values.indexOf(v);
          // console.log(v, i);
          array_ans[i][1]++;
      } else {
          array_values.push(v);
          array_ans.push([v, 1]);
          // console.log("\narray_values =");
          // console.log(array_values);
          // console.log("array_ans =");
          // console.log(array_ans);
      }
  }
  array_ans = array_ans.sort(function(a, b) {return (b[0] - a[0]);});
  return array_ans;
}

// 点数表示のhtml設定
function setScore(score) {
  return `${score}点`
}

// 系所属点を計算
function keisyozokuCalc(seiseki_data) {
  ans_dict = {}

	var seiseki_sort1 = seiseki_data.sort(function(a,b){return(a[2] - b[2]);});
  var seiseki_sort2 = seiseki_sort1.sort(function(a,b){return(b[1] - a[1]);});
  var seiseki_sort = seiseki_sort2.sort(function(a,b){return(b[0] - a[0]);});

  ans_dict["seiseki_sort"] = seiseki_sort;
  console.log(ans_dict["seiseki_sort"]);

  const max_i = 31;
  const max_elective_i = 14;
  const max_compulsory_i = 17;
  var count_i = 0;
  var count_elective_i = 0;
  var count_compulsory_i = 0;
  var score = 0;

  var compulsory_score = 0;
  var elective_score = 0;

  var compulsory_counted_array = [];
  var elective_counted_array = [];


  for (var array of seiseki_sort) {
    for (var i = 0; i < array[1]; i++) {
      if (array[2] == 1) {
        if (count_elective_i < max_elective_i) {
          count_elective_i++;
          count_i++;
          score += array[0];
          elective_score += array[0];
          elective_counted_array.push(array[0]);
        }
      } else {
        count_compulsory_i++;
        count_i++;
        score += array[0];
        compulsory_score += array[0];
        compulsory_counted_array.push(array[0]);
      }
      if (count_i == max_i) {
        break;
      }
    }
    if (count_i == max_i) {
      break;
    }
  }

  var compulsory_counter = counter(compulsory_counted_array);
  var elective_counter = counter(elective_counted_array);

  // console.log("計算に使用した必修科目の点数と単位数: ");
  var s = "<ul class='list-group'>"
  for (var tp of compulsory_counter) {
    s += `<li class="list-group-item">
    <div class="row">
      <div class="col text-center">${tp[0]}点</div>
      <div class="col text-center">${tp[1]}単位</div>
    </div>
    </li>\n`;
    // console.log(`\t${tp[0]}点, ${tp[1]}単位`);
  }
  ans_dict["compulsory_counter"] = s + "</ul>";

  var s2 = "<ul class='list-group'>";
  // console.log("\n計算に使用した選択科目の点数と単位数: ");
  for (var tp of elective_counter) {
    s2 += `<li class="list-group-item">
    <div class="row">
      <div class="col text-center">${tp[0]}点</div>
      <div class="col text-center">${tp[1]}単位</div>
    </div>
    </li>\n`;
    // console.log(`${tp[0]}点, ${tp[1]}単位`);
  }
  ans_dict["elective_counter"] = s2 + "</ul>";

  ans_dict["compulsory_score"] = setScore(compulsory_score)
  ans_dict["elective_score"] = setScore(elective_score)
  ans_dict["score"] = setScore(score)

  // console.log(`\n必修科目の系所属点の合計 = ${compulsory_score} 点`);
  // console.log(`選択科目の系所属点の合計 = ${elective_score} 点`);
  // console.log(`系所属点 = ${score} 点`);

  var error = "全科目31単位，必修科目17単位以上を満たしています";
  ans_dict["success"] = true;

  if (count_i < max_i) {
    ans_dict["success"] = false;
    error = `科目数が${max_i - count_i}単位分足りません`
    // console.log(`\n科目数が${max_i - count_i}単位分足りません`);
    if (count_compulsory_i < max_compulsory_i) {
      error += `<br>必修科目が${max_compulsory_i - count_compulsory_i}単位分足りません`
      // console.log(`必修科目が${max_compulsory_i - count_compulsory_i}単位分足りません`);
    }
  }

  ans_dict["error"] = error;

  return ans_dict
}