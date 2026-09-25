/**
 * SmartBox — Select com Busca Integrada e Auto-complete
 */
var smartbox_active = false;

function smartbox_bindEvents() {
    if (!jQuery('#smartbox-global-container').length) {
        jQuery('body').append('<div id=" smartbox-global-container\ class=\smartbox\></div>');
 }

 jQuery(document).off('focus', '.smartinput').on('focus', '.smartinput', function() {
 smartBoxOnFocus(this);
 });

 jQuery(document).off('blur', '.smartinput').on('blur', '.smartinput', function() {
 smartBoxOnFocusOut(this);
 });

 jQuery(document).off('keyup', '.smartinput').on('keyup', '.smartinput', function(e) {
 if (e.which === 13) {
 jQuery(this).blur();
 return;
 }
 smartBoxOnFocus(this);
 });

 jQuery(document).off('change', '.smartselect').on('change', '.smartselect', function() {
 let id = jQuery(this).attr('id');
 let selectedText = jQuery(this).find('option:selected').text() || '';
 let currentInputVal = jQuery('#' + id + '-smartinput').val();
 if (currentInputVal !== selectedText) {
 jQuery('#' + id + '-smartinput').val(selectedText);
 }
 });
}

function smartBoxOnFocus(inputEl) {
 let input = jQuery(inputEl);
 let selectId = input.data('for');
 let select = jQuery('#' + selectId);
 if (!select.length) return;

 let query = (input.val() || '').trim().toLowerCase();
 let min = parseInt(select.data('min') || 0);

 if (query.length < min) {
 jQuery('.smartbox').hide();
 return;
 }

 let offset = input.offset();
 let width = input.outerWidth();
 let height = input.outerHeight();

 let box = jQuery('#smartbox-global-container');
 box.css({
 top: offset.top + height + 2,
 left: offset.left,
 width: width,
 display: 'block'
 }).html('');

 let options = select.find('option');
 let selectedVal = select.val();
 let count = 0;

 options.each(function() {
 let val = jQuery(this).val();
 let text = jQuery(this).text();
 if (!val && !text) return;

 let matches = !query || text.toLowerCase().includes(query);
 if (matches) {
 count++;
 let isSelected = val === selectedVal ? ' smartbox-selected-item' : '';
 let itemHtml = '<div class=\smartbox-item + isSelected + \ data-for=\ + selectId + \ data-val=\ + val + \>' + text + '</div>';
 box.append(itemHtml);
 }
 });

 if (count === 0) {
 box.html('<div class=\smartbox-empty p-2 text-muted\>Nenhum resultado encontrado</div>');
 }

 box.find('.smartbox-item').off('mousedown').on('mousedown', function(e) {
 e.preventDefault();
 let val = jQuery(this).data('val');
 let parentSelectId = jQuery(this).data('for');
 let targetSelect = jQuery('#' + parentSelectId);
 
 targetSelect.val(val).trigger('change');
 let text = targetSelect.find('option:selected').text();
 jQuery('#' + parentSelectId + '-smartinput').val(text);
 box.hide();
 });
}

function smartBoxOnFocusOut(inputEl) {
 setTimeout(function() {
 jQuery('#smartbox-global-container').hide();
 }, 200);
}