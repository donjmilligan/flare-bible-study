<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no" name="viewport">
  <title>Flare Bible Study</title>
  <!-- General CSS Files -->
  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <link rel="stylesheet" type="text/css" media="all" href="assets/css/materialdesignicons.min.css?" />
  <!-- Google Fonts -->
  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
  <script>
    WebFont.load({
      google: {"families":["Montserrat:400,500,600,700","Patua+One","Special+Elite","Niramit"]},
      active: function() {
          sessionStorage.fonts = true;
      }
    });
  </script>
  <!-- CSS Libraries -->
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" type="text/css" media="all" href="assets/css/flare.css?1200" />
</head>
<body>
  <div id="app">
    <div class="main-wrapper main-wrapper-1">
      <?php include './include/nav.htm'; ?>
      <!-- Main Content 

      -->
      <div class="main-content">
        <!-- SECTION 1 
        -->
        <section class="section">
          <div class="section-body" id="showTexts">
              <!-- AJAX Displays here -->
          </div>

          <!-- SECTION 2 
          -->
          <div class="section-body">
            <div class="row ">
                <!-- D3 -->
                <div class="col-12 col-xl-9">
                  <div class="card">
                    <div class="card-header">
                      <div class="form-group">
                          <select class="form-control" id="translation-select">
                            <option value="t_kjv">King James Version</option>
                            <option value="t_asv">American Standard Version</option>
                            <option value="t_dby">Darby English Bible</option>
                            <option value="t_bbe">Bible in Basic English</option>
                            <option value="t_web">Webster's Bible</option>
                            <option value="t_web">World English Bible</option>
                            <option value="t_ylt">Young's Literal Translation</option>
                          </select>
                      </div>
                      <div class="form-group">
                        <select class="form-control book-select" id="book-select">
                            <option value="All" selected="">All Books</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <select class="form-control type-select" id="type-select">
                            <option value="All">All Subjects</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <select class="form-control" id="color-select">
                          <option value="Blue">Blue</option>
                          <option value="Purple">Purple</option>
                          <option value="Black">Black</option>
                          <option value="Rainbow">Rainbow</option>
                        </select>
                      </div>
                    </div>
                    <div id="bible-chart" class="card-body d-flex justify-content-center position-relative">

                        <!-- <svg id="paradoxes-chart" ></svg> -->

                         <div id="filter-notice" style="opacity: 0; display: none;">
                             <i class="icon-hand-left"></i> Check out these filters to modify the chart!
                         </div>
                         <div id="para-notice" style="opacity: 0; display: none;">
                             <i class="icon-hand-down"></i> Click a line for more info!
                         </div>
                         <div id="thread-desc" style="opacity: 1;"></div>
                    </div>
                    <div class="card-footer bg-whitesmoke">
                      <div id="thread-content" style="opacity: 1;"></div>  
                    </div>
                  </div>
                </div>
                <!-- // D3 -->

                <div class="col-12 col-md-3 mobile">
                    <div class="card nicescroll-box info-section-v2">
                      <div class="wrap">
                      <div class="card-body">
                        <ul class="nav nav-pills" id="myTab3" role="tablist">
                         
                          <li class="nav-item">
                            <a class="nav-link active" id="profile-tab3" data-toggle="tab" href="#about" role="tab" aria-controls="profile" aria-selected="false"><i class="mdi mdi-script-text"></i></a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" id="notes-tab3" data-toggle="tab" href="#instructions" role="tab" aria-controls="notes" aria-selected="false"><i class="mdi mdi-shield-key"></i></a>
                          </li>
                        </ul>
                        <hr class="pt-1 pb-3">
                        <div class="tab-content" id="myTabContent2">
                          
                          <div class="tab-pane fade show tabcontent active" id="about" role="tabpanel" aria-labelledby="profile-tab3">

                              <h2 class="fi77">Alpha Demo</h2>
                              <p style="font-size: large;"  class="fi12">See the menu for past studies</p>
                              <h5>Here's how it works so far</h5>
                              <p>The book and subject options until there are more studies, otherwise they can leave you without any options.</p>
                              <p><span class="source-item">1. </span>Each one of the blue and purple lines is a sequential chapter of the bible. The length of each chapter is shown. <strong> hover over each chapter to see more stats about it, or click on the chapter to read the chapter</strong></p><br/>
                              <p class="click"><span class="source-item">2. </span>The arcs show links between bible verses. Click on them to compare the two verses.</p><br/>
                              <p class="click"><span class="source-item">3. </span> This is a work in progress, there is lots to do. I am really looking forward to the simplicity of these studies. Anyone with 5 minutes can come and do some comparison once the notes are up for each link also.</p>

                              <div class="quotecontent"><i class="mdi mdi-format-quote-open"></i><p class="text_justify fi33"> And afterward, I will pour out My Spirit on all people. Your sons and daughters will prophesy, your old men will dream dreams, your young men will see visions. Even on My menservants and maidservants, I will pour out My Spirit in those days. I will show wonders in the heavens and on the earth, blood and fire and columns of smoke. The sun will be turned to darkness and the moon to blood before the coming of the great and awesome Day of the LORD. And everyone who calls on the name of the LORD will be saved; for on Mount Zion and in Jerusalem there will be deliverance, as the LORD promised, among the remnant called by the LORD.</p></div>
                              <div class="verse-container book fi33">Joel 2:28-32</div>
                            <div class="clear"></div>
                          </div>
                         
                          <div class="tab-pane fade tabcontent" id="instructions" role="tabpanel" aria-labelledby="contact-tab3">
                            <h3>Coming Soon! Notes for each verse comparison to be displayed here.</h3><br><br>
                            <i class="mdi mdi-pan" style="font-size: 300%"></i>&nbsp;&nbsp;&nbsp; <i class="mdi mdi-gesture-pinch" style="font-size: 300%"></i><br><br>
                            Pan and zoom to your hearts content, although you will need to be on a desktop or laptop. <br>
                            Use <i class="mdi mdi-format-line-weight"></i> the drop down lists to sort the studies.. <br><br><br>
                            <h5>Unlike the Hierarchical relationships in version 1.0, these are Lateral Relationships</h5>
                            <ul>
                              <li>Double-Click on the scripture boxes to go in and out of full screen.</li>
                              <li>Click on the  <span style="color: #2aa3b1;"><i class="mdi mdi-looks"></i></span> arcs to compare the texts</li>
                              <li>Click on the  <span style="color: #2aa3b1;"><i class="mdi mdi-format-align-left mdi-rotate-90"></i> Blue</span> and <span style="color: #6e4b91;"><i class="mdi mdi-format-align-left mdi-rotate-90"></i> Purple</span> rectangles to link to the full chapters</li>
                              <li>The verse numbers above link  to the Hebrew and Greek texts for each verse</li>
                            </ul>
                            <br>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

            </div>
            <!-- // ROW -->
        </div>
      </section>
    </div>

    <footer class="main-footer">
      <div class="footer-left">
          Web Sites by <a href="https://freelancedon.ca/">Don Milligan</a>
      </div>
                  <div class="footer-right">
                    MIT &copy;  2019
          </div>
      </footer>
              </div>
            </div>

  <!-- General JS Scripts -->
  <script src="assets/js/jquery-3.3.1.min.js"></script>
  <script src="assets/js/popper.min.js"></script>
  <script src="assets/js/bootstrap.min.js"></script>
  <script src="assets/js/jquery.nicescroll.min.js"></script>
  <script src="./assets/js/moment.min.js"></script>
  <script src="./assets/js/stisla.js"></script>

  <!-- JS Libraies -->
  <script src="./assets/js/d3.v4.min.js"></script>
  <script src="./assets/js/flare.js?038"></script>

  <!-- Page Specific JS File -->

  <!-- Template JS File -->
  <script src="./assets/js/scripts.js"></script>
  <script src="./assets/js/custom.js"></script>
    <script>
      $("document").ready(function() {
        // set nice scroll
        $(".nicescroll-box").niceScroll(".wrap",{
          cursorwidth: 7,
           boxzoom:true,
           cursoropacitymin: .3,
           cursoropacitymax: .8
         });

         
         if ($(window).width() > 1024) {
            setTimeout(function() {
                $(".sidebar-toggle").trigger('click');

            },10);
         }

      
      });
    </script>
</body>
</html>

