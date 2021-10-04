const regexPostcode = /\d{2}-\d{3}/
$.validator.addMethod("regexPostcode", function(value, element) {
    return this.optional( element ) || regexPostcode.test( value );
}, 'Proszę podać poprawny kod pocztowy');

$.validator.addMethod("alpha", function(value, element) {
    return this.optional( element ) || /^[a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ\s]+$/.test( value );
}, 'Proszę wpisać poprawną miejscowość');

$(document).change(function () {
    $(".form").validate();
})

const validator = $(".form").validate({
    rules: {
        name: {
            required: true,
            minlength: 3
        },
        surname: {
            required: true,
            minlength: 3
        },
        email: {
            required: true,
            email: true,
        },
        phone: {
            required: true,
            number: true,
            minlength: 9,
            maxlength: 9
        },
        postcode: {
            required: true,
            regexPostcode: true
        },
        city: {
            required: true,
            alpha: true
        },
        street: {
            required: true
        },
        building: {
            required: true
        }
    },
    messages: {
        name: {
            required: "Proszę podać imię",
            minlength: "Proszę podać minimum 3 litery"
        },
        surname: {
            required: "Proszę podać nazwisko",
            minlength: "Proszę podać minimum 3 litery"
        },
        email: {
            required: "Prosze podać e-mail",
            email: "Proszę podać poprawy adres e-mail"
        },
        phone: {
            required: "Proszę podać numer telefonu",
            number: "Proszę podać poprawy numer",
            minlength: "Proszę podać poprawy numer",
            maxlength: "Proszę podać poprawy numer"
        },
        postcode: {
            required: "Proszę podać kod pocztowy",
        },
        city: {
            required: "Proszę podać miejscowość",
        },
        street: {
            required: "Proszę podać ulicę"
        },
        building: {
            required: "Proszę podać numer budynku"
        }
    },
    submitHandler: function(form) {
        form.submit();
    }
})

function toggle(e) {
    e.stopPropagation();
    if(!$(e.target).closest('.form-box').find('.list').hasClass('active')) {
        hideList();
    }
    $(e.target).closest('.form-box').find('.list').toggleClass('active');
    $(e.target).closest('.form-box').find('.arrow').toggleClass('rotate');
}

function hideList() {
    $('.list').removeClass('active');
    $('.arrow').removeClass('rotate')
}

function removeList() {
    $('.street__list').remove();
    $('.city__list').remove();
}

function changeInputValueAndValidate(data) {
    $('#city').val(data.find(el => el.miejscowosc)?.miejscowosc)
    $('#street').val(data.find(el => el.ulica)?.ulica)

    if($('#city').val() !== '') {
        validator.element('#city');        
    }

    if($('#street').val() !== '') {     
        validator.element('#street');  
    }
}

function createList(data) {
    if($('#city').val() !== '') {
        const uniqueCity = [...new Set(data.filter(el => el.miejscowosc).map(el => el.miejscowosc))]
        $('.city-box').append(
            `
            <ul class="list city__list">
                ${uniqueCity.map(el => `<li class="list-item">${el}</li>`).join('')}
            </ul>
            `
        )
        $('.city-box').find('.arrow-container').show();
    }else {
        $('.city-box').find('.arrow-container').hide();
    }

    if($('#street').val() !== '') {
        $('.street-box').append(
            `
            <ul class="list street__list">
                ${data.filter(el => el.ulica).map(el => `<li class="list-item">${el.ulica}</li>`).join('')}
            </ul>
            `
        )
        $('.street-box').find('.arrow-container').show();
    }else {
        $('.street-box').find('.arrow-container').hide();
    }

    $('.list').click(function(e) {
        $(e.target).closest('.form-box').find('input').val($(e.target).text())
        toggle(e);
        }
    )  
}

$('.arrow-container').hide();
$('.arrow-container').click(toggle);
$(document).click(hideList)

$("input[name=postcode]").keypress(function(e) {
    if(this.value.length === 2) {
        this.value += '-'
    }
}).keyup(function(e) {
    if(e.key === 'Backspace' && this.value.length === 3) {
        this.value = this.value.replace('-', '');
    }

    if(regexPostcode.test(this.value)) {
        $.ajax({
            headers: {
                Accept: 'application/json'
            },
            url: `http://kodpocztowy.intami.pl/api/${this.value}`,
            success: function(data) {
                removeList();
                changeInputValueAndValidate(data);
                createList(data);
            },
            error: function() {
                return null
            }
        })
    }
})
