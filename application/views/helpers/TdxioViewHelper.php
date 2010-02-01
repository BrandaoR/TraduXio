<?php
// application/views/helpers/TdxioViewHelper.php
/***
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 **/

class TdxioViewHelper extends Zend_View_Helper_Abstract {

    public function setView(Zend_View_Interface $view)
    {
        $this->view=$view;
    }

    protected $_logger=null;
    protected function log($message='',$title=null,$priority=1) {
        if (!$this->_logger) {
            global $logger;
            $this->_logger=$logger;
        }
        if (is_null($message)) {
            $message="{NULL}";
        } elseif (is_bool($message)) {
            $message="{".($message ? 'TRUE':'FALSE')."}";
        } elseif (is_array($message) || is_object($message)) {
            $message=print_r($message,true);
        }
        if (null !== $title) $message="[$title] : ".$message;
        $this->_logger->log($message,$priority);
    }
}

?>