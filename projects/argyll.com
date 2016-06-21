<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Kyle Ruane, Multidisciplinary Designer & Aspiring Webmaster</title>
  
    <!-- Fonts -->
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic' rel='stylesheet' type='text/css'>

  	<!-- Styles - Bootstrap, UI Scaffolding, Custom Theme -->
  	<link rel="stylesheet" href="../css/style.css">

  	<!--[if lt IE 9]>
  	<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>

    <div class="site-wrapper">

    <header class="site-header">
        <div class="header-wrap">

            <!-- Logo -->
            <h1 class="logo">
                <a href="/">
                    <img src="../images/logo_small.svg">
                </a>
                <span>Kyle Ruane</span>
            </h1>
          	
            <!-- Main Navigation -->
            <nav class="main-nav">
                <ul>
                    <li class="active"><a href="/">Work</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/blog">Blog</a></li>
                </ul>
            </nav>

        </div>

        <!-- Mobile Menu  -->
        <div class="mobile-menu">
            <span class="mobile-logo">
                <img src="../images/logo_small.svg">
            </span>
        </div>
        <!-- Hamburger Button -->
        <a href="#" class="nav-toggle" id="nav-toggle">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </a>

    </header>



	<div class="placeholder"></div>

	<main class="single">
		<div class="container">
			
			<section class="project-intro">
				<div class="floater">
					<h2>Argyll Studios</h2>
		  			<div>
			  			<p>All things visual for a small creative studio I ran with <a href="https://twitter.com/timwco">@timwco</a> that specialized in custom WordPress solutions.</p>
			  		</div>
			  	</div>
			</section>

			<section class="project-content">
				<div class="feature">
			  		<img src="../images/argyll/hero.jpg">
			  	</div>
			  	<div class="images">
				    <p class="half"><img src="../images/argyll/mark.jpg"></p>
				    <p class="half"><img src="../images/argyll/cards.jpg"></p>
				    <p class="half"><img src="../images/argyll/prop.jpg"></p>
				    <p class="half"><img src="../images/argyll/shirt.jpg"></p>
				    <p><img src="../images/argyll/graphic.jpg"></p>
				    <p><img src="../images/argyll/site_pages.jpg"></p>
				</div>
			</section>

		</div>
	</main>


	<footer class="site-footer">
		<div class="container">
			<div class="row">
		  		<div class="social">
		  			<ul>
		  				<li><a href="https://twitter.com/kyleruane"><i class="fa fa-twitter"></i></a></li>
			  			<li><a href="https://www.instagram.com/kyleruane/"><i class="fa fa-instagram"></i></a></li>
			  			<li><a href="https://dribbble.com/kyleruane"><i class="fa fa-dribbble"></i></a></li>
			  		</ul>
		  		</div>
		  		<div class="copyright">
					<p>© Kyle Ruane</p>
			  	</div>
		  	</div>
		  </div>
	</footer>

	</div> <!-- closes site-wrapper -->

<!-- JS -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script type="text/javascript" src="js/custom.modernizr.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script type="text/javascript" src="js/jasny-bootstrap.min.js"></script>
<script type="text/javascript" src="js/formstone.js"></script>
<script type="text/javascript" src="js/jquery.fitvids.js"></script>
<script type="text/javascript" src="js/gray.js"></script>
<script type="text/javascript" src="js/plain.js"></script>
<script type="text/javascript" src="js/theme.js"></script>

</body>
</html>