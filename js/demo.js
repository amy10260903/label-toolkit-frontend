import { uploadFile } from '/api/fingerprint.js';
import { getOptions } from '/api/option.js';
import { dragElement, resizeElement } from '/js/interact.js';
import { exportCSVFile } from '/js/export.js';

const results = {};

/**
 * GET options for select-list
 */
$( document ).ready(function() {
    getOptions()
        .then(function (response) {
            console.log(response);
            response.data.results.forEach((key => {
                let option = document.createElement("option");
                option.text = key;
                $('#select-location').append(option);
            }))
            $('select').niceSelect();
        })
        .catch(function (response) {
            console.log(response);
        });
});

/**
 * UPDATE filename of uploaded audio track
 */
$('#upload-btn').change(function() {
    $('#upload-label')[0].textContent = this.files[0].name;
});

/**
 * EVENTS
 */
const Audio = {};
let tgl = true;
Audio.play = function() {
    Spectrum.play();

    $('#btn-stop')[0].disabled = false;
    $('#btn-pause')[0].disabled = false;
    $('#btn-play')[0].disabled = true;
}
Audio.pause = function() {
    Spectrum.pause();

    $('#btn-pause')[0].disabled = true;
    $('#btn-play')[0].disabled = false;
}
Audio.stop = function() {
    Spectrum.stop();

    $('#btn-stop')[0].disabled = true;
    $('#btn-pause')[0].disabled = true;
    $('#btn-play')[0].disabled = false;
}
Audio.toggle = function() {
    tgl?$('#btn-play').click():$('#btn-pause').click();
    tgl=!tgl;
}

$('#btn-play').click(Audio.play);
$('#btn-pause').click(Audio.pause);
$('#btn-stop').click(Audio.stop);
$(window).keypress(function (e) {
  if (e.keyCode == 0 || e.keyCode == 32) {
    e.preventDefault();
    Audio.toggle();
  }
})

$('#btn-export').click(function(){
    let filename = $('.current')[1].innerHTML;
    if (filename == 'Result') {
        alert('Please select a file!');
        return;
    }
    let label = $('#text-label').val();
    let headers = ['id', 'start', 'end', 'label'];
    exportCSVFile(headers, results[filename].timestamp, label, filename);
});

$('#slider').change(function() {
    Spectrum.zoom(Number(this.value));
});

Spectrum.on('ready', function() {
   $('#btn-play')[0].disabled = false;
});

/**
 * INIT loaders
 */
$('.loader-inner').loaders();

const Loader = {};
Loader.show = function () {
    $('#section-loader')[0].style.display = 'block';
}
Loader.hide = function() {
    $('#section-loader')[0].style.display = 'none';
    $('#selection-form')[0].style.display = 'none';
    $('#candidate')[0].style.display = 'block';
    $('#label')[0].style.display = 'block';
    $('#export')[0].style.display = 'block';
}

/**
 * POST analysis uploaded audio track
 */
function startAnalysis() {
    console.log('startAnalysis');
    const data = {
        category: $(".current")[0].innerHTML,
        file: $("#upload-btn").prop('files')[0],
    };
    Loader.show();
    Loader.hide();
    $.getJSON('/assets/dataset/json/test_results.json', function( json ) {
        // console.log(json);
        getLabel();
        getDetail(json.results);
        updateSpectrum();
    });
    // uploadFile(data)
    //     .then(function (response) {
    //         console.log(response);
    //         Loader.hide();
    //         getLabel();
    //         getDetail(response.data.results);
    //         updateSpectrum();
    //     })
    //     .catch(function (response) {
    //         console.log(response);
    //     });
}

/**
 * UPDATE list and show the results
 */
function getLabel() {
    let label = $("#upload-btn").val().split(/^.*[\\\/]/).pop().split('.').shift() || 'sound-event-name';
    $('#text-label').attr('value', label);
}
function getDetail(data) {
    data.forEach((object) => {
        // selection menu
        let option = document.createElement("option");
        option.text = object.song_name;
        $('#select-soundsource').append(option);

        // block for each segment
        let content = document.createElement("div");
        content.setAttribute("class", "content-segment");
        content.setAttribute("id", `content-segment-${object.song_name}`);
        $('.wrapper').append(content);

        results[object.song_name] = {
            'duration': 0,
            'timestamp': object.timestamp_in_seconds,
            'is_plot': false,
        };
    });
    $('select').niceSelect('update');
}

/**
 * UPDATE show corresponded spectrum of selected audio track
 */
function updateSpectrum() {
    const key = $('.current')[1].innerHTML;
    Spectrum.load(`/assets/dataset/TW_TPE/${key}.wav`);
    Spectrum.on('ready', function() {
        addSegments($('.current')[1].innerHTML);
    });
}

/**
 * ADD candidate segments for selected audio track
 */
function addSegments(key){
    // console.log('addSegment');
    $('.content-segment').each(function() {
        if (this.id == `content-segment-${key}`) {
            this.style.display = "block";
        } else {
            this.style.display = "none";
        }
    })
    if (!results[key].is_plot) {
        const duration = Spectrum.getDuration();
        results[key].duration = duration;
        results[key].timestamp.forEach((obj,idx) => {
            if (obj.onset < duration) {
                let segment = document.createElement("div"),
                    segment_drag = document.createElement("div");
                segment.setAttribute("class", "item");
                segment.setAttribute("id", `segment-${idx}`);
                segment.style.display = 'block';
                segment.style.left = (obj.onset/duration)*80 + 'vw';
                if (obj.offset > duration) {
                    segment.style.width = ((duration-obj.onset)/duration)*80 + 'vw';
                } else {
                    segment.style.width = ((obj.offset-obj.onset)/duration)*80 + 'vw';
                }
                segment_drag.setAttribute("class", "item-drag");
                segment.appendChild(segment_drag);
                $(`#content-segment-${key}`).append(segment);

                segment.addEventListener('click', function() {
                    let currentProgress = obj.onset/duration;
                    Spectrum.seekTo(currentProgress);

                    $('.item').each( function(idx) {
                        // console.log(id, idx);
                        this.classList.remove("item-focus");
                    });
                    this.classList.add("item-focus");
                    dragElement(this, key);
                    resizeElement(this, key);
                });
            }
        });
        results[key].is_plot = true;
    }
}

export {
    startAnalysis,
    updateSpectrum,
    results,
};