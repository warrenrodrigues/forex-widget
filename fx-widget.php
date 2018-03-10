<?php
date_default_timezone_set("Asia/Calcutta");

// Fetch the forex data
$ch = curl_init("https://www.warrenasia.com/widgets/fx/get-rates.json");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$json = curl_exec($ch);
curl_close($ch);
$rateData = json_decode($json);

//Set default currencies and then check if specific currencies have been passed
$currencyList = array('USD','EUR','JPY','GBP','CHF','CAD','AUD','ZAR');
if (!empty($_GET['currencyList'])) {
	$currencyList = explode(',', $_GET['currencyList']);
}
$newRateData = array();
foreach($currencyList as $currencyItem) {
	if (isset($rateData->rates->$currencyItem)) {
		$newRateData[$currencyItem] = $rateData->rates->$currencyItem;
	}
}

//Set default base value and then check if value has been passed
$baseValue = 1000;
if (!empty($_GET['baseValue']) && is_numeric($_GET['baseValue'])) {
	$baseValue = $_GET['baseValue'];
}

//Build HTML for the actual widget
$outputHTML = "
<div id=\"fxConversionWidget\">
	<div class=\"baseValue\">
		Convert INR <input type=\"text\" id=\"fxFrom\" name=\"fxFrom\" value=\"".$baseValue."\"> to
	</div>
	<table id=\"fxTable\">";
	$count = 0;
	foreach ($newRateData as $currency => $rate) {
		if ($count == 0) {
			$outputHTML .= "
		<tr>";
		}
		$outputHTML .= "
			<td>
				<span class=\"fxLabel\">".$currency."</span> <span class=\"fxValue\" id=\"fx".$currency."\">1</span>
			</td>";
		if ($count >= 3) {
			$outputHTML .= "
		</tr>";
			$count = 0;
		} else {
			$count++;
		}
	}
	
	if ($count != 0) {
		for($i=$count;$count<=3;$count++){
			$outputHTML .= "
			<td></td>";
		}
		$outputHTML .= "
		</tr>";
	}
	$outputHTML .= "
	</table>
	<div class=\"fxLegend\"><b>Rates updated:</b> ".date('j M Y', $rateData->timestamp)."</div>
	<div class=\"fxCredit\"><a target=\"_blank\" href=\"https://www.warrenasia.com/widgets/fx/\" rel=\"nofollow\">Currency Exchange Widget by Warrenasia</a></div>
</div>";

//Setup array to be encoded to JSON
$html = array(
	'html'		=> $outputHTML,
	'rateData'	=> $newRateData
);

//Setup array to be encoded to JSON
header("Content-Type: application/javascript");
echo $_GET['callback']."( ".json_encode($html)." )";
?>