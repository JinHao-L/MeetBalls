export default function CustomBootstrapStyle() {
  return (
    <style type="text/css">
      {`

    .btn:focus, .btn:active {
      outline: none !important;
      outline-offset: none !important;
      box-shadow: none !important;
    }

    .btn-primary {
      background-color: #8F6B58;
      color: #white;
      border-color: #8F6B58;
    }
    .btn-primary:hover, .btn-primary:active, .btn-primary:focus {
      background-color: #725546;
      color: white;
      border-color: #725546;
    }
    .btn-primary:disabled {
      background-color: #8f7c72;
      color: #white;
      border-color: #8f7c72;
    }

    .btn-outline-primary {
      color: #8F6B58;
      border-color: #8F6B58;
    }
    .btn-outline-primary:hover, .btn-outline-primary:active, .btn-outline-primary:focus {
      background-color: #8F6B58;
      color: white;
      border-color: #8F6B58;
    }
    .btn-outline-primary:disabled {
      color: #8f7c72;
      border-color: #8f7c72;
    }

    .btn-secondary {
      background-color: white;
      color: #8F6B58;
      border-color: #8F6B58;
    }
    .btn-secondary:hover, .btn-secondary:active, .btn-secondary:focus {
      background-color: #725546;
      color: white;
      border-color: #725546;
    }
    .btn-secondary:disabled {
      background-color: #8f7c72;
      color: white;
      border-color: #8f7c72;
    }

    .btn-danger {
      background-color: #f65454;
      color: white;
      border-color: #f65454;
    }
    .btn-danger:hover, .btn-danger:active, .btn-danger:focus {
      background-color: #d63030;
      color: white;
      border-color: #d63030;
    }
    .btn-danger:disabled {
      background-color: #c96565;
      color: white;
      border-color: #c96565;
    }

    .btn-outline-danger {
      background-color: white;
      color: #f65454;
      border-color: #f65454;
    }
    .btn-outline-danger:hover, .btn-outline-danger:active, .btn-outline-danger:focus {
      background-color: #d63030;
      color: white;
      border-color: #d63030;
    }
    .btn-outline-danger:disabled {
      color: #c96565;
      border-color: #c96565;
    }

    .btn-outline-facebook {
      color: #3b5998;
      border-color: #3b5998;
    }
    .btn-outline-facebook:hover {
      background-color: #3b5998;
      color: white;
      border-color: #3b5998;
    }

    .btn-outline-tiktok {
      color: #000000;
      border-color: #000000;
    }
    .btn-outline-tiktok:hover {
      background-color: #000000;
      color: white;
      border-color: #000000;
    }

    .social-link-btn {
      text-align: left;
      width: 220px;
    }

    .btn-zoom {
      background-color: #2D8CFF;
      color: white;
      border-color: #2D8CFF;
    }
    .btn-zoom:hover {
      background-color: #357dd4;
      color: white;
      border-color: #357dd4;
    }

    .btn-card-left {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-width: 1px 0.5px 0px 0px;
      border-color: #ebebeb;
    }
    .btn-card-left:hover, .btn-card-left:active, .btn-card-left:focus {
      background-color: #8F6B58;
      color: white;
      border-color: #8F6B58;
    }

    .btn-card-left-light {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .btn-card-left-light:hover, .btn-card-left-light:active, .btn-card-left-light:focus {
      background-color: rgba(0, 0, 0, 0.05);
      color: white;
    }

    .btn-card-left-cancel {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-width: 1px 0.5px 0px 0px;
      border-color: #8F6B58;
      color: #8F6B58;
    }
    .btn-card-left-cancel:hover, .btn-card-left-cancel:active, .btn-card-left-cancel:focus {
      background-color: #a88979;
      color: white;
    }

    .btn-card-left-danger { 
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-width: 1px 0.5px 0px 0px;
      border-color: #ebebeb;
    }
    .btn-card-left-danger:hover, .btn-card-left-danger:active, .btn-card-left-danger:focus {
      background-color: #f65454;
      color: white;
      border-color: #f65454;
    }
    
    .btn-card-right {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-left-radius: 0;
      border-width: 1px 0px 0px 0.5px;
      border-color: #ebebeb;
    }
    .btn-card-right:hover, .btn-card-right:active, .btn-card-right:focus {
      background-color: #8F6B58;
      color: white;
      border-color: #8F6B58;
    }

    .btn-card-right-danger { 
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-left-radius: 0;
      border-width: 1px 0px 0px 0.5px;
      border-color: #ebebeb;
    }
    .btn-card-right-danger:hover, .btn-card-right-danger:active, .btn-card-right-danger:focus {
      background-color: #f65454;
      color: white;
      border-color: #f65454;
    }

    .btn-card-right-danger-light { 
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-left-radius: 0;
      border-width: 1px 0px 0px 0.5px;
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .btn-card-right-danger-light:hover, .btn-card-right-danger-light:active, .btn-card-right-danger-light:focus {
      background-color: rgba(0, 0, 0, 0.2);
      color: white;
    }

    .btn-card-right-confirm {
      background-color: #8F6B58;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-left-radius: 0;
      border-width: 1px 0px 0px 0.5px;
      border-color: #8F6B58;
      color: white;
    }
    .btn-card-right-confirm:hover, .btn-card-right-confirm:active, .btn-card-right-confirm:focus {
      background-color: #725546;
      color: white;
    }

    .btn-card-middle {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-width: 1px 0.5px 0px 0px;
      border-color: #ebebeb;
    }
    .btn-card-middle:hover, .btn-card-middle:active, .btn-card-middle:focus {
      background-color: #8F6B58;
      color: white;
      border-color: #8F6B58;
    }

    .card {
      border-radius: 6px;
      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
    }

    .bg-primary {
      background-color: #8F6B58!important;
      color: white;
    }

    .bg-secondary {
      background-color: #f28f71!important;
      color: white;
    }

    .bg-success {
      background-color: #4CA982!important;
      color: white;
    }

    .bg-danger {
      background-color: #f65454!important;
      color: white;
    }

    .bg-warning {
      background-color: #edb124!important;
      color: white;
    }

    .bg-landing1 {
      background-color: #9CA5B7!important;
    }

    .bg-landing-content1 {
      background-color: #e9edf2!important;
    }

    .bg-landing2 {
      background-color: #A6B4B3!important;
    }

    .bg-landing-content2 {
      background-color: #edf7f5!important;
    }

    .bg-landing3 {
      background-color: #B8A4A6!important;
    }

    .bg-landing-content3 {
      background-color: #fcf5f6!important;
    }

    .border-primary {
      border-color: #8F6B58!important;
      border-width: 1px;
    }

    .nav-footer .nav-link {
      color: #8F6B58;
      padding: 0;
    }

    .nav-footer .nav-link:hover {
      color: #000000;
    }

    .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
      background-color: #8F6B58;
      color: white;
      border-radius: 20px;
      text-align: center;
      margin-right: 10px;
      margin-bottom: 10px;
      padding-left: 20px;
      padding-right: 20px;
    }

    .nav-tabs .nav-link {
      color: #8F6B58;
      border-radius: 20px;
      border-color: #8F6B58;
      text-align: center;
      margin-right: 10px;
      margin-bottom: 10px;
      padding-left: 20px;
      padding-right: 20px;
    }

    .nav-tabs {
      border-width: 0px;
    }

    .nav-tabs .nav-link:hover {
      border-color: #725546;
      background-color: #725546;
      color: white;
    }

    .card .card-text {
      white-space: pre-line;
    }

    .dropdown-menu {
      max-height: 200px;
      overflow-y: scroll;
    }

    .pagination a {
      color: #8F6B58;
      outline: none !important;
      outline-offset: none !important;
      box-shadow: none !important;
    }

    .pagination a:hover {
      background-color: #a88979;
      border-radius: #a88979;
      color: #FFFFFF;
    }

    .page-item.active .page-link {
      background-color: transparent;
      color: #FFFFFF;
      border-color: transparent;
    }

    `}
    </style>
  );
}
