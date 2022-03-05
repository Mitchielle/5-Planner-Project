// toggle password visibility
$('#eyes').on('click', function() {
  var x = document.getElementById("password");
  var y = document.getElementById("eyes");
  if (x.type == "password") {
    x.type = "text";
    y.className = "fa fa-eye";
  } else {
    x.type = "password";
    y.className = "fa fa-eye-slash";
  }
});

//bootstrap tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

 //date picker
 var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                  
 $('#startDate').datepicker({
     uiLibrary: 'bootstrap4',
     iconsLibrary: 'fontawesome',
     minDate: today,
     maxDate: function () {
         return $('#endDate').val();
     }
 });
 $('#endDate').datepicker({
     uiLibrary: 'bootstrap4',
     iconsLibrary: 'fontawesome',
     minDate: function () {
         return $('#startDate').val();
     }
 });

 $('#dueDate').datepicker({
  uiLibrary: 'bootstrap4',
  iconsLibrary: 'fontawesome',
  minDate: function () {
    return $('#startDate').val();
  },
  maxDate: function () {
      return $('#endDate').val();
  }
});


//intervals

$(function(){
if( $('#intset').val() === 'Interval 5'){
  $('#newint').hide()
}
if($('#intervals').children("option:selected").attr('value') !== $('#hidint').val()){
  $('#intset').val('Interval 1')
 if ($('#intsethead').val() === 'Interval 1' && $('#intervals').val() !== $('#hidint').val() ){
     $('#intset').val('Interval 2') ;
    } else if ($('#intsethead').val() === 'Interval 2'){
     $('#intset').val('Interval 3') ;
    } else if ($('#intsethead').val() === 'Interval 3'){
     $('#intset').val('Interval 4') ;
    } else if ($('#intsethead').val() === 'Interval 4'){
     $('#intset').val('Interval 5') ;
  }
}
})

var x = $('#hidint').val();
var y = $('#intsethead').val();
var $select = document.querySelector('#intervals');
var $options = Array.from($select.options);
var optionToSelect = $options.find(item => item.text == x);
optionToSelect.selected = true;
$('#intervals option:not(:selected)').prop('disabled',true);
$('#intset').val(y)



